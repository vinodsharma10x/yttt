import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StepIndicator } from "@/components/thumbnail/StepIndicator";
import { YouTubePreview } from "@/components/thumbnail/YouTubePreview";
import { VideoDetailsStep } from "@/components/thumbnail/VideoDetailsStep";
import { ThumbnailTextStep } from "@/components/thumbnail/ThumbnailTextStep";
import { BackgroundDesignStep } from "@/components/thumbnail/BackgroundDesignStep";

export const ThumbnailGenerator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleSize, setTitleSize] = useState(72);
  const [descriptionSize, setDescriptionSize] = useState(36);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channelName, setChannelName] = useState("Your Channel");

  // Step 1 data
  const [selectedTitle, setSelectedTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [emotion, setEmotion] = useState("");
  const [icp, setIcp] = useState("");
  const [channelNiche, setChannelNiche] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [contentPillars, setContentPillars] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Load channel name
      const { data: profile } = await supabase
        .from("profiles")
        .select("channel_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.channel_name) {
        setChannelName(profile.channel_name);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawText();
      };
      img.src = image;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#FF0000");
      gradient.addColorStop(1, "#FF6B00");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawText();
    }
  };

  const drawText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (title || description) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (title) {
      ctx.font = `bold ${titleSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const titleY = canvas.height / 2 - 50;
      const textMetrics = ctx.measureText(title);
      const textWidth = textMetrics.width;
      const textHeight = titleSize;
      
      const padding = 30;
      const rectX = canvas.width / 2 - textWidth / 2 - padding;
      const rectY = titleY - textHeight / 2 - padding / 2;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding;
      const borderRadius = 15;

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.moveTo(rectX + borderRadius, rectY);
      ctx.lineTo(rectX + rectWidth - borderRadius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + borderRadius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - borderRadius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - borderRadius, rectY + rectHeight);
      ctx.lineTo(rectX + borderRadius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - borderRadius);
      ctx.lineTo(rectX, rectY + borderRadius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeText(title, canvas.width / 2, titleY);
      ctx.fillText(title, canvas.width / 2, titleY);
    }

    if (description) {
      ctx.font = `${descriptionSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const descY = canvas.height / 2 + 50;
      const textMetrics = ctx.measureText(description);
      const textWidth = textMetrics.width;
      const textHeight = descriptionSize;
      
      const padding = 20;
      const rectX = canvas.width / 2 - textWidth / 2 - padding;
      const rectY = descY - textHeight / 2 - padding / 2;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding;
      const borderRadius = 10;

      ctx.fillStyle = "rgba(255, 193, 7, 0.9)";
      ctx.beginPath();
      ctx.moveTo(rectX + borderRadius, rectY);
      ctx.lineTo(rectX + rectWidth - borderRadius, rectY);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + borderRadius);
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - borderRadius);
      ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - borderRadius, rectY + rectHeight);
      ctx.lineTo(rectX + borderRadius, rectY + rectHeight);
      ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - borderRadius);
      ctx.lineTo(rectX, rectY + borderRadius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeText(description, canvas.width / 2, descY);
      ctx.fillText(description, canvas.width / 2, descY);
    }
  };

  const downloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "youtube-thumbnail.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Thumbnail downloaded!");
      }
    });
  };

  useEffect(() => {
    drawThumbnail();
  }, [image, title, description, titleSize, descriptionSize]);

  const handleStep1Complete = (data: {
    title: string;
    videoDescription: string;
    emotion: string;
    icp: string;
    channelNiche: string;
    brandVoice: string;
    contentPillars: string[];
  }) => {
    setSelectedTitle(data.title);
    setVideoDescription(data.videoDescription);
    setEmotion(data.emotion);
    setIcp(data.icp);
    setChannelNiche(data.channelNiche);
    setBrandVoice(data.brandVoice);
    setContentPillars(data.contentPillars);
    setCurrentStep(2);
    toast.success("Moving to thumbnail text generation");
  };

  const handleStep2Complete = (mainText: string, subtitle: string) => {
    setTitle(mainText);
    setDescription(subtitle);
    setCurrentStep(3);
    toast.success("Moving to background design");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 bg-gradient-primary bg-clip-text text-transparent">
            YouTube Thumbnail & Title Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Create AI-powered titles and eye-catching thumbnails in seconds
          </p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-card border-border shadow-elevation">
            {currentStep === 1 && (
              <VideoDetailsStep onComplete={handleStep1Complete} />
            )}
            {currentStep === 2 && (
              <ThumbnailTextStep
                selectedTitle={selectedTitle}
                videoDescription={videoDescription}
                emotion={emotion}
                icp={icp}
                channelNiche={channelNiche}
                brandVoice={brandVoice}
                onComplete={handleStep2Complete}
              />
            )}
            {currentStep === 3 && (
              <BackgroundDesignStep
                onImageUpload={setImage}
                titleSize={titleSize}
                setTitleSize={setTitleSize}
                descriptionSize={descriptionSize}
                setDescriptionSize={setDescriptionSize}
                onDownload={downloadThumbnail}
              />
            )}
          </Card>

          <YouTubePreview 
            canvasRef={canvasRef} 
            title={selectedTitle}
            channelName={channelName}
          />
        </div>

        {/* Hidden canvas for actual thumbnail generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
