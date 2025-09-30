import { useState, useRef, useEffect } from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleGenerator } from "@/components/TitleGenerator";
import { toast } from "sonner";

export const ThumbnailGenerator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleSize, setTitleSize] = useState(72);
  const [descriptionSize, setDescriptionSize] = useState(36);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw title
    if (title) {
      ctx.font = `bold ${titleSize}px Arial, sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const titleY = canvas.height / 2 - 50;
      ctx.strokeText(title, canvas.width / 2, titleY);
      ctx.fillText(title, canvas.width / 2, titleY);
    }

    // Draw description
    if (description) {
      ctx.font = `${descriptionSize}px Arial, sans-serif`;
      ctx.fillStyle = "#FFFF00";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      const descY = canvas.height / 2 + 50;
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

  const handleSelectTitle = (selectedTitle: string) => {
    setTitle(selectedTitle);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
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
                <TitleGenerator onSelectTitle={handleSelectTitle} />
              </TabsContent>

              <TabsContent value="thumbnail" className="space-y-6">
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
                Title
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
                Description
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
                  Description Size: {descriptionSize}px
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
