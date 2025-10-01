import { useState, useRef, useEffect } from "react";
import { Upload, Download, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleGenerator } from "@/components/TitleGenerator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ThumbnailTextOption {
  mainText: string;
  subtitle: string;
  reason: string;
}

export const ThumbnailGenerator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleSize, setTitleSize] = useState(72);
  const [descriptionSize, setDescriptionSize] = useState(36);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for thumbnail text generation
  const [videoDescription, setVideoDescription] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [emotion, setEmotion] = useState("");
  const [icp, setIcp] = useState("");
  const [generatedThumbnailTexts, setGeneratedThumbnailTexts] = useState<ThumbnailTextOption[]>([]);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to YouTube thumbnail dimensions (1280x720)
    canvas.width = 1280;
    canvas.height = 720;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if available
    if (image) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawText();
      };
      img.src = image;
    } else {
      // Draw gradient background if no image
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

    // Add semi-transparent overlay for better text readability
    if (title || description) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw title with background
    if (title) {
      ctx.font = `bold ${titleSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const titleY = canvas.height / 2 - 50;
      const textMetrics = ctx.measureText(title);
      const textWidth = textMetrics.width;
      const textHeight = titleSize;
      
      // Draw background rectangle with rounded corners
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

      // Draw title text
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeText(title, canvas.width / 2, titleY);
      ctx.fillText(title, canvas.width / 2, titleY);
    }

    // Draw subtitle with background
    if (description) {
      ctx.font = `${descriptionSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const descY = canvas.height / 2 + 50;
      const textMetrics = ctx.measureText(description);
      const textWidth = textMetrics.width;
      const textHeight = descriptionSize;
      
      // Draw background rectangle with rounded corners
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

      // Draw subtitle text
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

  const handleTitleGenerated = (titleData: { title: string; videoDescription: string; emotion: string; icp: string }) => {
    setSelectedTitle(titleData.title);
    setVideoDescription(titleData.videoDescription);
    setEmotion(titleData.emotion);
    setIcp(titleData.icp);
    toast.success("Title selected! Switch to Thumbnail Design to generate text.");
  };

  const generateThumbnailText = async () => {
    if (!videoDescription || !selectedTitle || !emotion) {
      toast.error("Please generate and select a title first");
      return;
    }

    setIsGeneratingText(true);
    setGeneratedThumbnailTexts([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-thumbnail-text', {
        body: { videoDescription, selectedTitle, emotion, icp }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedThumbnailTexts(data.thumbnailOptions || []);
      toast.success("Thumbnail text generated!");
    } catch (error) {
      console.error('Error generating thumbnail text:', error);
      toast.error("Failed to generate thumbnail text");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleSelectThumbnailText = (mainText: string, subtitle: string) => {
    setTitle(mainText);
    setDescription(subtitle);
    toast.success("Thumbnail text applied!");
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Profile
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <Card className="p-6 bg-gradient-card border-border shadow-elevation">
            <Tabs defaultValue="title" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="title">AI Title Generator</TabsTrigger>
                <TabsTrigger value="thumbnail">Thumbnail Design</TabsTrigger>
              </TabsList>

              <TabsContent value="title" className="space-y-6">
                <TitleGenerator onSelectTitle={handleTitleGenerated} />
              </TabsContent>

              <TabsContent value="thumbnail" className="space-y-6">
                {/* AI Thumbnail Text Generator */}
                <div className="space-y-4 pb-6 border-b border-border">
                  <div>
                    <Label className="text-lg font-bold mb-2 block">AI Thumbnail Text</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate short, powerful text for your thumbnail overlay
                    </p>
                    <Button
                      onClick={generateThumbnailText}
                      disabled={isGeneratingText || !selectedTitle}
                      className="w-full"
                      variant="outline"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGeneratingText ? "Generating..." : "Generate Thumbnail Text"}
                    </Button>
                  </div>

                  {generatedThumbnailTexts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Select Thumbnail Text:</Label>
                      {generatedThumbnailTexts.map((option, index) => (
                        <Card
                          key={index}
                          className="p-4 cursor-pointer hover:border-primary transition-colors"
                          onClick={() => handleSelectThumbnailText(option.mainText, option.subtitle)}
                        >
                          <div className="space-y-2">
                            <p className="font-bold text-lg">{option.mainText}</p>
                            {option.subtitle && (
                              <p className="font-semibold text-base text-yellow-600">{option.subtitle}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{option.reason}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {!selectedTitle && (
                    <p className="text-sm text-muted-foreground italic">
                      Generate a title first to unlock AI thumbnail text
                    </p>
                  )}
                </div>

            <div>
              <Label htmlFor="image-upload" className="text-lg font-bold mb-3 block">
                Background Image
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-lg font-bold mb-3 block">
                Main Text
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your catchy title..."
                className="text-lg h-12"
              />
              <div className="mt-3">
                <Label className="text-sm text-muted-foreground">Title Size: {titleSize}px</Label>
                <Slider
                  value={[titleSize]}
                  onValueChange={(value) => setTitleSize(value[0])}
                  min={40}
                  max={120}
                  step={4}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-bold mb-3 block">
                Subtitle
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a subtitle..."
                className="text-lg h-12"
              />
              <div className="mt-3">
                <Label className="text-sm text-muted-foreground">
                  Subtitle Size: {descriptionSize}px
                </Label>
                <Slider
                  value={[descriptionSize]}
                  onValueChange={(value) => setDescriptionSize(value[0])}
                  min={20}
                  max={60}
                  step={2}
                  className="mt-2"
                />
              </div>
            </div>

                <Button
                  onClick={downloadThumbnail}
                  className="w-full h-14 text-lg font-bold bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Thumbnail
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Preview Panel */}
          <Card className="p-6 bg-gradient-card border-border shadow-elevation">
            <Label className="text-lg font-bold mb-4 block">Preview (1280x720)</Label>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Your thumbnail will be optimized for YouTube's 16:9 format
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
