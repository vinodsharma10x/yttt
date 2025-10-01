import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Eye, TrendingUp } from "lucide-react";

interface ChannelStatsCardsProps {
  connectionData: any;
  videos: any[];
}

export const ChannelStatsCards = ({ connectionData, videos }: ChannelStatsCardsProps) => {
  const totalViews = videos.reduce((sum, video) => sum + (video.view_count || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.like_count || 0), 0);
  const avgEngagement = videos.length > 0 
    ? ((totalLikes / totalViews) * 100).toFixed(2)
    : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {connectionData.subscriber_count?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total subscribers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {connectionData.video_count?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Published videos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Channel Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {connectionData.view_count?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All-time views</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgEngagement}%</div>
          <p className="text-xs text-muted-foreground mt-1">Recent videos avg</p>
        </CardContent>
      </Card>
    </div>
  );
};
