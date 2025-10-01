import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Eye, ThumbsUp } from "lucide-react";

interface TopPerformersProps {
  videos: any[];
}

export const TopPerformers = ({ videos }: TopPerformersProps) => {
  // Sort by views and get top 5
  const topByViews = [...videos]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  // Sort by engagement rate and get top 5
  const topByEngagement = [...videos]
    .map(video => ({
      ...video,
      engagementRate: video.view_count 
        ? ((video.like_count || 0) / video.view_count) * 100 
        : 0
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5);

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 by Views
          </CardTitle>
          <CardDescription>Your most viewed videos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topByViews.map((video, index) => (
            <div key={video.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2 mb-2">{video.title}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{video.view_count?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{video.like_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top 5 by Engagement
          </CardTitle>
          <CardDescription>Highest engagement rate videos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topByEngagement.map((video, index) => (
            <div key={video.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2 mb-2">{video.title}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{video.engagementRate.toFixed(2)}% engagement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{video.view_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
