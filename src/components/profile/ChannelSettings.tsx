import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ChannelSettingsProps {
  userId: string;
}

export const ChannelSettings = ({ userId }: ChannelSettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    video_formats: [] as string[],
    target_video_length: "",
    publishing_frequency: "",
    performance_goals: "",
  });

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("channel_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings({
          video_formats: data.video_formats || [],
          target_video_length: data.target_video_length || "",
          publishing_frequency: data.publishing_frequency || "",
          performance_goals: JSON.stringify(data.performance_goals || {}, null, 2),
        });
      }
    } catch (error: any) {
      toast.error("Failed to load channel settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let performanceGoalsJson = {};
      try {
        performanceGoalsJson = settings.performance_goals ? JSON.parse(settings.performance_goals) : {};
      } catch {
        toast.error("Invalid JSON in performance goals");
        setSaving(false);
        return;
      }

      const payload = {
        user_id: userId,
        video_formats: settings.video_formats,
        target_video_length: settings.target_video_length,
        publishing_frequency: settings.publishing_frequency,
        performance_goals: performanceGoalsJson,
      };

      // Try to update first
      const { data: existing } = await supabase
        .from("channel_settings")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("channel_settings")
          .update(payload)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("channel_settings")
          .insert(payload);

        if (error) throw error;
      }

      toast.success("Settings updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Settings</CardTitle>
        <CardDescription>
          Configure your content strategy and performance goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="video-formats">Video Formats</Label>
          <Textarea
            id="video-formats"
            placeholder="Enter your video formats, one per line (e.g., Tutorials, Case Studies, Quick Tips)"
            value={settings.video_formats.join("\n")}
            onChange={(e) => setSettings({ ...settings, video_formats: e.target.value.split("\n").filter(f => f.trim()) })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-length">Target Video Length</Label>
          <Input
            id="target-length"
            placeholder="e.g., 10-15 minutes, 5-7 minutes"
            value={settings.target_video_length}
            onChange={(e) => setSettings({ ...settings, target_video_length: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishing-frequency">Publishing Frequency</Label>
          <Input
            id="publishing-frequency"
            placeholder="e.g., 3 times per week"
            value={settings.publishing_frequency}
            onChange={(e) => setSettings({ ...settings, publishing_frequency: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="performance-goals">Performance Goals (JSON)</Label>
          <Textarea
            id="performance-goals"
            placeholder='{"monthly_views": 10000, "avg_ctr": "5%", "target_subscribers": 5000}'
            value={settings.performance_goals}
            onChange={(e) => setSettings({ ...settings, performance_goals: e.target.value })}
            rows={6}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Enter performance goals as JSON (e.g., target views, CTR, subscribers)
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
