import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, ThumbsUp, MessageCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VideoListProps {
  videos: any[];
}

export const VideoList = ({ videos }: VideoListProps) => {
  const getEngagementRate = (views: number, likes: number) => {
    if (!views) return "0.00";
    return ((likes / views) * 100).toFixed(2);
  };

  const getPerformanceBadge = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 5) return <Badge variant="default">Excellent</Badge>;
    if (numRate >= 3) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="outline">Average</Badge>;
  };

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Videos</CardTitle>
          <CardDescription>
            No videos synced yet. Click the Sync button in Channel Info to fetch your videos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Videos</CardTitle>
        <CardDescription>
          Your last {videos.length} videos with performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Likes</TableHead>
                <TableHead className="text-center">Comments</TableHead>
                <TableHead className="text-center">Engagement</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-center">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => {
                const engagementRate = getEngagementRate(
                  video.view_count || 0,
                  video.like_count || 0
                );
                return (
                  <TableRow key={video.id}>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-3">
                        {video.thumbnail_url && (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-2 text-sm">{video.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{video.view_count?.toLocaleString() || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{video.like_count?.toLocaleString() || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{video.comment_count?.toLocaleString() || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(engagementRate)}
                      <div className="text-xs text-muted-foreground mt-1">{engagementRate}%</div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {video.published_at && typeof video.published_at === 'string'
                        ? formatDistanceToNow(new Date(video.published_at), { addSuffix: true })
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="text-center">
                      <a
                        href={`https://youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
