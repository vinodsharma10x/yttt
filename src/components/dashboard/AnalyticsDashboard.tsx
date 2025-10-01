import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ChannelStatsCards } from "./ChannelStatsCards";
import { VideoList } from "./VideoList";
import { TopPerformers } from "./TopPerformers";
import { toast } from "sonner";

interface AnalyticsDashboardProps {
  userId: string;
}

export const AnalyticsDashboard = ({ userId }: AnalyticsDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [connectionData, setConnectionData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Set up realtime subscription for video updates
    const channel = supabase
      .channel('youtube_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Load YouTube connection data
      const { data: connection, error: connError } = await supabase
        .from('youtube_connections')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (connError) throw connError;

      if (!connection) {
        toast.info("Connect your YouTube channel to see analytics");
        setLoading(false);
        return;
      }

      setConnectionData(connection);

      // Load videos
      const { data: videosData, error: videosError } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('user_id', userId)
        .order('published_at', { ascending: false })
        .limit(20);

      if (videosError) throw videosError;

      setVideos(videosData || []);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!connectionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your YouTube Channel</CardTitle>
          <CardDescription>
            Connect your YouTube account in the Channel Info tab to see your analytics here
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ChannelStatsCards connectionData={connectionData} videos={videos} />
      <TopPerformers videos={videos} />
      <VideoList videos={videos} />
    </div>
  );
};
