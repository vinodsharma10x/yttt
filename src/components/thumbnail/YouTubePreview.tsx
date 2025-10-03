import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface YouTubePreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  title: string;
  channelName?: string;
}

export const YouTubePreview = ({ canvasRef, title, channelName = "Your Channel" }: YouTubePreviewProps) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !displayCanvasRef.current) return;

    const ctx = displayCanvasRef.current.getContext("2d");
    if (!ctx) return;

    // Copy the main canvas to display canvas
    const img = new Image();
    img.src = canvasRef.current.toDataURL();
    img.onload = () => {
      if (displayCanvasRef.current) {
        displayCanvasRef.current.width = 1280;
        displayCanvasRef.current.height = 720;
        ctx.drawImage(img, 0, 0);
      }
    };
  }, [canvasRef.current?.toDataURL()]);

  const truncateTitle = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  const displayTitle = title || "Your Video Title Will Appear Here";
  const charCount = title.length;
  const isOverLimit = charCount > 100;

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-elevation">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">YouTube Preview</h3>
      </div>

      {/* Thumbnail Preview */}
      <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg mb-4">
        <canvas
          ref={displayCanvasRef}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Video Info - YouTube Style */}
      <div className="space-y-3">
        <div>
          <h4 className={`font-semibold text-base leading-tight line-clamp-2 ${
            isOverLimit ? "text-destructive" : ""
          }`}>
            {truncateTitle(displayTitle)}
          </h4>
          <p className={`text-xs mt-1 ${
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          }`}>
            {charCount}/100 characters {isOverLimit && "(Too long for YouTube)"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {channelName.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-medium">{channelName}</p>
            <p className="text-muted-foreground text-xs">
              • Just now
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Live preview • 1280x720 • 16:9 format
      </p>
    </Card>
  );
};
