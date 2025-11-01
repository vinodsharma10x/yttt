/**
 * EDGE FUNCTIONS REFERENCE
 * This file contains all edge functions for reference and documentation purposes.
 * Actual edge functions are deployed from supabase/functions/ directory.
 */

// ============================================================================
// 1. GENERATE TITLES
// Path: supabase/functions/generate-titles/index.ts
// JWT Required: false (SECURITY ISSUE - should be true)
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoDescription, targetKeyword, emotion, icp, channelNiche, brandVoice, contentPillars } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log("Generating video titles with AI");

    const systemPrompt = `You are an expert YouTube title generator specializing in creating high-performing, click-worthy titles that balance curiosity, clarity, and SEO optimization. Your titles should:
- Be between 50-70 characters (ideal for visibility)
- Include the target keyword naturally
- Evoke the specified emotion
- Appeal to the target audience (ICP)
- Use proven psychological triggers (curiosity gaps, numbers, power words)
- Avoid clickbait while maintaining intrigue
- Align with the channel's niche and brand voice
${contentPillars ? `- Relate to these content pillars: ${contentPillars.join(', ')}` : ''}

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3",
    "Title 4",
    "Title 5"
  ]
}`;

    const userPrompt = `Generate 5 YouTube video titles for:
Video Description: ${videoDescription}
${targetKeyword ? `Target Keyword: ${targetKeyword}` : ''}
Emotion to Evoke: ${emotion}
${icp ? `Target Audience: ${icp}` : ''}
${channelNiche ? `Channel Niche: ${channelNiche}` : ''}
${brandVoice ? `Brand Voice: ${brandVoice}` : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable AI workspace." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    console.log("AI response received");

    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const titles = JSON.parse(content);

    return new Response(
      JSON.stringify(titles),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-titles function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// ============================================================================
// 2. GENERATE THUMBNAIL TEXT
// Path: supabase/functions/generate-thumbnail-text/index.ts
// JWT Required: false (SECURITY ISSUE - should be true)
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoDescription, selectedTitle, emotion, icp, channelNiche, brandVoice } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log("Generating thumbnail text with AI");

    const systemPrompt = `You are an expert at creating YouTube thumbnail text that maximizes click-through rates. Generate compelling thumbnail text that:

RULES:
- Main text: 2-6 words maximum, highly readable
- Use ALL CAPS for emphasis
- Create curiosity gap or promise value
- Complement the title without repeating it
- Be bold, clear, and instantly understandable
- Use power words that trigger ${emotion}
- Appeal to ${icp || 'the target audience'}
- Match the ${brandVoice || 'brand voice'}
- Consider the ${channelNiche || 'channel niche'}

Return ONLY a JSON object (no markdown, no extra text):
{
  "options": [
    {
      "mainText": "PRIMARY TEXT",
      "subText": "optional smaller text"
    }
  ]
}

Generate 3 options.`;

    const userPrompt = `Create thumbnail text for:
Title: ${selectedTitle}
Video: ${videoDescription}
Emotion: ${emotion}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable AI workspace." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(content);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-thumbnail-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// ============================================================================
// 3. GENERATE BACKGROUND
// Path: supabase/functions/generate-background/index.ts
// JWT Required: false (SECURITY ISSUE - should be true)
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log("Generating thumbnail background with prompt:", prompt);

    const enhancedPrompt = `Create a high-quality YouTube thumbnail background (1280x720): ${prompt}. Make it vibrant, eye-catching, and optimized for text overlay. Ultra high resolution, professional quality.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your Lovable AI workspace." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated in response');
    }

    return new Response(
      JSON.stringify({ image: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-background function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// ============================================================================
// 4. YOUTUBE GET AUTH URL
// Path: supabase/functions/youtube-get-auth-url/index.ts
// JWT Required: false (SECURITY ISSUE - should be true)
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { redirectUri } = await req.json();
    
    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');

    if (!clientId) {
      throw new Error('YouTube client ID not configured');
    }

    const scope = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    console.log('Generated YouTube OAuth URL');

    return new Response(
      JSON.stringify({ authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating auth URL:', error);
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

// ============================================================================
// 5. YOUTUBE COMPLETE AUTH
// Path: supabase/functions/youtube-complete-auth/index.ts
// JWT Required: true ✓
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const { code, redirectUri } = await req.json();
    
    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('YouTube credentials not configured');
    }

    console.log('Exchanging authorization code for tokens');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained tokens');

    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const error = await channelResponse.text();
      console.error('Failed to fetch channel info:', error);
      throw new Error('Failed to fetch channel information');
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      throw new Error('No YouTube channel found for this account');
    }

    console.log('Successfully fetched channel info:', channel.snippet.title);

    const connectionData = {
      user_id: user.id,
      channel_id: channel.id,
      channel_title: channel.snippet.title,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      subscriber_count: parseInt(channel.statistics.subscriberCount),
      video_count: parseInt(channel.statistics.videoCount),
      view_count: parseInt(channel.statistics.viewCount),
    };

    const { error: insertError } = await supabaseClient
      .from('youtube_connections')
      .upsert(connectionData, { onConflict: 'user_id' });

    if (insertError) {
      console.error('Failed to store connection:', insertError);
      throw new Error('Failed to store YouTube connection');
    }

    return new Response(
      JSON.stringify({
        success: true,
        channelTitle: channel.snippet.title,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in youtube-complete-auth:', error);
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

// ============================================================================
// 6. YOUTUBE SYNC
// Path: supabase/functions/youtube-sync/index.ts
// JWT Required: true ✓
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: connection, error: connectionError } = await supabaseClient
      .from('youtube_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('No YouTube connection found');
    }

    let accessToken = connection.access_token;
    const tokenExpiresAt = new Date(connection.token_expires_at);

    if (tokenExpiresAt <= new Date()) {
      console.log('Access token expired, refreshing...');
      
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
      const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const tokens = await refreshResponse.json();
      accessToken = tokens.access_token;

      await supabaseClient
        .from('youtube_connections')
        .update({
          access_token: tokens.access_token,
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    }

    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel statistics');
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos');
    }

    const videosData = await videosResponse.json();
    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch video statistics');
    }

    const statsData = await statsResponse.json();

    const videos = statsData.items.map((video: any) => ({
      user_id: user.id,
      video_id: video.id,
      title: video.snippet.title,
      thumbnail_url: video.snippet.thumbnails.high.url,
      published_at: video.snippet.publishedAt,
      view_count: parseInt(video.statistics.viewCount || '0'),
      like_count: parseInt(video.statistics.likeCount || '0'),
      comment_count: parseInt(video.statistics.commentCount || '0'),
    }));

    const { error: upsertError } = await supabaseClient
      .from('youtube_videos')
      .upsert(videos, { onConflict: 'video_id' });

    if (upsertError) {
      throw new Error('Failed to sync videos');
    }

    await supabaseClient
      .from('youtube_connections')
      .update({
        subscriber_count: parseInt(channel.statistics.subscriberCount),
        video_count: parseInt(channel.statistics.videoCount),
        view_count: parseInt(channel.statistics.viewCount),
        last_synced_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        syncedVideos: videos.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * ENVIRONMENT VARIABLES REQUIRED:
 * - LOVABLE_API_KEY: For AI generation functions
 * - YOUTUBE_CLIENT_ID: For YouTube OAuth
 * - YOUTUBE_CLIENT_SECRET: For YouTube OAuth
 * - SUPABASE_URL: Auto-provided
 * - SUPABASE_ANON_KEY: Auto-provided
 */
