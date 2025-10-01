import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const jwt = authHeader.replace('Bearer ', '').trim();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Syncing YouTube data for user:', user.id);

    // Get YouTube connection
    const { data: connection, error: connectionError } = await supabaseClient
      .from('youtube_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('No YouTube connection found');
    }

    // Refresh token if needed
    let accessToken = connection.access_token;
    const expiresAt = new Date(connection.token_expires_at);
    
    if (expiresAt < new Date()) {
      console.log('Access token expired, refreshing...');
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
      const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await refreshResponse.json();
      accessToken = tokens.access_token;

      // Update stored tokens
      await supabaseClient
        .from('youtube_connections')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('id', connection.id);
    }

    // Fetch recent videos
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${connection.channel_id}&maxResults=10&order=date&type=video`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos');
    }

    const videosData = await videosResponse.json();
    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');

    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch video statistics');
    }

    const statsData = await statsResponse.json();

    // Update channel statistics
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${connection.channel_id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (channelResponse.ok) {
      const channelData = await channelResponse.json();
      const stats = channelData.items[0]?.statistics;
      
      await supabaseClient
        .from('youtube_connections')
        .update({
          subscriber_count: parseInt(stats.subscriberCount),
          video_count: parseInt(stats.videoCount),
          view_count: parseInt(stats.viewCount),
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', connection.id);
    }

    // Store/update videos
    for (const video of statsData.items) {
      const videoData = {
        user_id: user.id,
        video_id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        published_at: video.snippet.publishedAt,
        thumbnail_url: video.snippet.thumbnails.high.url,
        view_count: parseInt(video.statistics.viewCount || 0),
        like_count: parseInt(video.statistics.likeCount || 0),
        comment_count: parseInt(video.statistics.commentCount || 0),
        duration: video.contentDetails.duration,
        tags: video.snippet.tags || [],
      };

      await supabaseClient
        .from('youtube_videos')
        .upsert(videoData, { onConflict: 'video_id' });
    }

    console.log(`Successfully synced ${statsData.items.length} videos`);

    return new Response(
      JSON.stringify({ 
        success: true,
        videosCount: statsData.items.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in youtube-sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
