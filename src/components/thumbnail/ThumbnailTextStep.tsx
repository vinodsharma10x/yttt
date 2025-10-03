import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ThumbnailTextOption {
  mainText: string;
  subtitle: string;
  reason: string;
}

interface ThumbnailTextStepProps {
  selectedTitle: string;
  videoDescription: string;
  emotion: string;
  icp: string;
  channelNiche: string;
  brandVoice: string;
  onComplete: (mainText: string, subtitle: string) => void;
}

export const ThumbnailTextStep = ({
  selectedTitle,
  videoDescription,
  emotion,
  icp,
  channelNiche,
  brandVoice,
  onComplete,
}: ThumbnailTextStepProps) => {
  const [generatedTexts, setGeneratedTexts] = useState<ThumbnailTextOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedText, setSelectedText] = useState<{ mainText: string; subtitle: string } | null>(null);

  const generateThumbnailText = async () => {
    setIsGenerating(true);
    setGeneratedTexts([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-thumbnail-text', {
        body: {
          videoDescription,
          selectedTitle,
          emotion,
          icp,
          channelNiche,
          brandVoice,
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedTexts(data.thumbnailOptions || []);
      toast.success("Thumbnail text generated!");
    } catch (error) {
      console.error('Error generating thumbnail text:', error);
      toast.error("Failed to generate thumbnail text");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectText = (mainText: string, subtitle: string) => {
    setSelectedText({ mainText, subtitle });
    toast.success("Thumbnail text selected!");
  };

  const handleNext = () => {
    if (selectedText) {
      onComplete(selectedText.mainText, selectedText.subtitle);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          2
        </div>
        <h2 className="text-2xl font-bold">Generate Thumbnail Text</h2>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <Label className="text-sm font-semibold">Selected Title:</Label>
        <p className="mt-2 font-medium">{selectedTitle}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Generate short, powerful text optimized for thumbnail overlays that will grab attention and drive clicks.
        </p>
        <Button
          onClick={generateThumbnailText}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Thumbnail Text...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Thumbnail Text
            </>
          )}
        </Button>
      </div>

      {generatedTexts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Select Thumbnail Text</h3>
          <div className="space-y-2">
            {generatedTexts.map((option, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedText?.mainText === option.mainText
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary hover:shadow-md"
                }`}
                onClick={() => handleSelectText(option.mainText, option.subtitle)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      {selectedText?.mainText === option.mainText && (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-lg">{option.mainText}</p>
                        {option.subtitle && (
                          <p className="font-semibold text-base text-yellow-600 mt-1">{option.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.reason}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedText && (
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full bg-gradient-primary"
        >
          Next: Design Background
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
