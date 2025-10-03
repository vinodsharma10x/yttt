import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TitleOption {
  title: string;
  score: number;
  reason: string;
}

interface VideoDetailsStepProps {
  onComplete: (data: {
    title: string;
    videoDescription: string;
    emotion: string;
    icp: string;
    channelNiche: string;
    brandVoice: string;
    contentPillars: string[];
  }) => void;
}

export const VideoDetailsStep = ({ onComplete }: VideoDetailsStepProps) => {
  const [videoDescription, setVideoDescription] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [emotion, setEmotion] = useState("excited");
  const [icp, setIcp] = useState("");
  const [channelNiche, setChannelNiche] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [contentPillars, setContentPillars] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<TitleOption[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load ICP
        const { data: audienceProfiles } = await supabase
          .from("audience_profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_primary", true)
          .maybeSingle();

        if (audienceProfiles) {
          const icpText = buildICPText(audienceProfiles);
          setIcp(icpText);
        }

        // Load profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("channel_niche, brand_voice, content_pillars")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setChannelNiche(profile.channel_niche || "");
          setBrandVoice(profile.brand_voice || "");
          setContentPillars(profile.content_pillars || []);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, []);

  const buildICPText = (profile: any): string => {
    const parts = [];
    if (profile.current_state) parts.push(`Current state: ${profile.current_state}`);
    if (profile.desired_state) parts.push(`Desired state: ${profile.desired_state}`);
    if (profile.age_range) parts.push(`Age: ${profile.age_range}`);
    if (profile.profession) parts.push(`Profession: ${profile.profession}`);
    if (profile.pain_points?.length) parts.push(`Pain points: ${profile.pain_points.join(", ")}`);
    if (profile.goals?.length) parts.push(`Goals: ${profile.goals.join(", ")}`);
    if (profile.unique_angle) parts.push(`Your unique angle: ${profile.unique_angle}`);
    return parts.join(". ");
  };

  const generateTitles = async () => {
    if (!videoDescription.trim()) {
      toast.error("Please enter a video description");
      return;
    }

    setIsGenerating(true);
    setGeneratedTitles([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-titles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            videoDescription,
            targetKeyword: targetKeyword || "video",
            emotion,
            icp: icp || "",
            channelNiche: channelNiche || "",
            brandVoice: brandVoice || "",
            contentPillars: contentPillars || [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate titles");
      }

      const data = await response.json();
      setGeneratedTitles(data.titles || []);
      toast.success(`Generated ${data.titles?.length || 0} title options!`);
    } catch (error) {
      console.error("Error generating titles:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate titles");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTitle = (title: string) => {
    setSelectedTitle(title);
    toast.success("Title selected!");
  };

  const handleNext = () => {
    onComplete({
      title: selectedTitle,
      videoDescription,
      emotion,
      icp,
      channelNiche,
      brandVoice,
      contentPillars,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          1
        </div>
        <h2 className="text-2xl font-bold">Describe Your Video & Generate Title</h2>
      </div>

      {icp && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Info className="w-4 h-4" />
                <span>Using your primary audience profile</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">{icp}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="video-description" className="text-base font-semibold">
            Video Description *
          </Label>
          <Textarea
            id="video-description"
            placeholder="Describe your video content in detail. What is it about? What value does it provide? (e.g., 'A step-by-step tutorial showing beginners how to bake perfect chocolate chip cookies with professional tips')"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            className="mt-2 min-h-[120px] resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="target-keyword">Target Keyword</Label>
            <Input
              id="target-keyword"
              placeholder="e.g., cookie recipe"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="emotion">Emotion / Tone</Label>
            <Select value={emotion} onValueChange={setEmotion}>
              <SelectTrigger id="emotion" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excited">Excited</SelectItem>
                <SelectItem value="curiosity">Curiosity</SelectItem>
                <SelectItem value="shocking">Shocking</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="entertaining">Entertaining</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateTitles}
          disabled={isGenerating || !videoDescription.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Titles...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Titles
            </>
          )}
        </Button>
      </div>

      {generatedTitles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Select Your Title</h3>
          <div className="space-y-2">
            {generatedTitles.map((titleOption, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedTitle === titleOption.title
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary hover:shadow-md"
                }`}
                onClick={() => handleSelectTitle(titleOption.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start gap-2">
                        {selectedTitle === titleOption.title && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        )}
                        <p className="font-medium leading-tight">{titleOption.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{titleOption.reason}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {titleOption.score}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTitle && (
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full bg-gradient-primary"
        >
          Next: Create Thumbnail Text
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
