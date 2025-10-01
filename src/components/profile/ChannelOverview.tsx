import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
interface ChannelOverviewProps {
  userId: string;
}

export const ChannelOverview = ({ userId }: ChannelOverviewProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [profile, setProfile] = useState({
    channel_name: "",
    channel_niche: "",
    upload_schedule: "",
    content_pillars: [] as string[],
    brand_voice: "",
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      // Load profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          channel_name: data.channel_name || "",
          channel_niche: data.channel_niche || "",
          upload_schedule: data.upload_schedule || "",
          content_pillars: data.content_pillars || [],
          brand_voice: data.brand_voice || "",
        });
      }

      // Load YouTube connection data
      const { data: ytData, error: ytError } = await supabase
        .from("youtube_connections")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (ytData) {
        setYoutubeData(ytData);
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          channel_name: profile.channel_name,
          channel_niche: profile.channel_niche,
          upload_schedule: profile.upload_schedule,
          content_pillars: profile.content_pillars,
          brand_voice: profile.brand_voice,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile");
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
    <div className="space-y-6">
      {youtubeData && (
        <Card>
          <CardHeader>
            <CardTitle>YouTube Channel Statistics</CardTitle>
            <CardDescription>
              Real-time data from your connected YouTube channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Channel Name</p>
                <p className="text-2xl font-bold">{youtubeData.channel_title}</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Subscribers</p>
                <p className="text-2xl font-bold">{youtubeData.subscriber_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Videos</p>
                <p className="text-2xl font-bold">{youtubeData.video_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Views</p>
                <p className="text-2xl font-bold">{youtubeData.view_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg col-span-1 md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Last Synced</p>
                <p className="text-lg font-semibold">
                  {youtubeData.last_synced_at 
                    ? new Date(youtubeData.last_synced_at).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Channel Overview</CardTitle>
          <CardDescription>
            Basic information about your YouTube channel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="channel-name">Channel Name</Label>
          <Input
            id="channel-name"
            placeholder="Your YouTube Channel Name"
            value={profile.channel_name}
            onChange={(e) => setProfile({ ...profile, channel_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel-niche">Channel Niche</Label>
          <Input
            id="channel-niche"
            placeholder="e.g., Programming, Entrepreneurship, AI Development"
            value={profile.channel_niche}
            onChange={(e) => setProfile({ ...profile, channel_niche: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="upload-schedule">Upload Schedule</Label>
          <Input
            id="upload-schedule"
            placeholder="e.g., 3 times per week, Every Monday and Friday"
            value={profile.upload_schedule}
            onChange={(e) => setProfile({ ...profile, upload_schedule: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-pillars">Content Pillars</Label>
          <Textarea
            id="content-pillars"
            placeholder="Enter your main content themes, one per line (e.g., AI Tools, Side Projects, Career Advice)"
            value={profile.content_pillars.join("\n")}
            onChange={(e) => setProfile({ ...profile, content_pillars: e.target.value.split("\n").filter(p => p.trim()) })}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Enter each content pillar on a new line</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-voice">Brand Voice / Tone</Label>
          <Textarea
            id="brand-voice"
            placeholder="Describe your channel's personality and communication style (e.g., Friendly, encouraging, technical but approachable)"
            value={profile.brand_voice}
            onChange={(e) => setProfile({ ...profile, brand_voice: e.target.value })}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
    </div>
  );
};
