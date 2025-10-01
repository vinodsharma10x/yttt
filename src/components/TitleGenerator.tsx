import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TitleOption {
  title: string;
  score: number;
  reason: string;
}

interface TitleGeneratorProps {
  onSelectTitle: (data: { title: string; videoDescription: string; emotion: string; icp: string }) => void;
}

export const TitleGenerator = ({ onSelectTitle }: TitleGeneratorProps) => {
  const [videoDescription, setVideoDescription] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [emotion, setEmotion] = useState("excited");
  const [icp, setIcp] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<TitleOption[]>([]);

  useEffect(() => {
    // Load user's primary ICP on component mount
    const loadPrimaryICP = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: audienceProfiles } = await supabase
          .from("audience_profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_primary", true)
          .maybeSingle();

        if (audienceProfiles) {
          // Build a formatted ICP string from the primary profile
          const icpText = buildICPText(audienceProfiles);
          setIcp(icpText);
        }
      } catch (error) {
        console.error("Failed to load primary ICP:", error);
      }
    };

    loadPrimaryICP();
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
    onSelectTitle({ title, videoDescription, emotion, icp });
    toast.success("Title selected!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="video-description" className="text-base font-semibold">
            Video Description
          </Label>
          <Textarea
            id="video-description"
            placeholder="Describe your video content (e.g., 'A quick tutorial on baking chocolate chip cookies from scratch')"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            className="mt-2 min-h-[100px] resize-none"
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
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="comparison">Comparison</SelectItem>
                <SelectItem value="credibility">Credibility</SelectItem>
                <SelectItem value="curious">Curious</SelectItem>
                <SelectItem value="curiosity">Curiosity</SelectItem>
                <SelectItem value="desire">Desire</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="entertaining">Entertaining</SelectItem>
                <SelectItem value="excited">Excited</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="negativity">Negativity</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="shocking">Shocking</SelectItem>
                <SelectItem value="time">Time</SelectItem>
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
          <h3 className="text-lg font-semibold">Generated Titles</h3>
          <div className="space-y-2">
            {generatedTitles.map((titleOption, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                onClick={() => handleSelectTitle(titleOption.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-tight">{titleOption.title}</p>
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
    </div>
  );
};
