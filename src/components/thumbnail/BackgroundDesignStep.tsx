import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BackgroundDesignStepProps {
  onImageUpload: (imageData: string) => void;
  titleSize: number;
  setTitleSize: (size: number) => void;
  descriptionSize: number;
  setDescriptionSize: (size: number) => void;
  onDownload: () => void;
}

export const BackgroundDesignStep = ({
  onImageUpload,
  titleSize,
  setTitleSize,
  descriptionSize,
  setDescriptionSize,
  onDownload,
}: BackgroundDesignStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backgroundPrompt, setBackgroundPrompt] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target?.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIBackground = async () => {
    if (!backgroundPrompt.trim()) {
      toast.error("Please describe the background you want");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-background', {
        body: { prompt: backgroundPrompt }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.image) {
        onImageUpload(data.image);
        toast.success("AI background generated!");
      }
    } catch (error) {
      console.error('Error generating background:', error);
      toast.error("Failed to generate background");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          3
        </div>
        <h2 className="text-2xl font-bold">Upload or Generate Background</h2>
      </div>

      {/* AI Background Generation */}
      <div className="space-y-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Generate AI Background
        </Label>
        <Input
          placeholder="Describe your ideal thumbnail background (e.g., 'Vibrant kitchen scene with baking ingredients, bright and colorful')"
          value={backgroundPrompt}
          onChange={(e) => setBackgroundPrompt(e.target.value)}
          className="h-12"
        />
        <Button
          onClick={generateAIBackground}
          disabled={isGenerating || !backgroundPrompt.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Background...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Background
            </>
          )}
        </Button>
      </div>

      {/* Manual Upload */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Or Upload Your Own Image
        </Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input
            ref={fileInputRef}
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

      {/* Text Size Controls */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <Label className="text-base font-semibold">Main Text Size: {titleSize}px</Label>
          <Slider
            value={[titleSize]}
            onValueChange={(value) => setTitleSize(value[0])}
            min={40}
            max={120}
            step={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-semibold">
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

      {/* Download Button */}
      <Button
        onClick={onDownload}
        className="w-full h-14 text-lg font-bold bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
      >
        <Download className="w-5 h-5 mr-2" />
        Download Thumbnail
      </Button>
    </div>
  );
};
