import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AudienceProfileFormProps {
  userId: string;
  profileId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AudienceProfileForm = ({ userId, profileId, onSuccess, onCancel }: AudienceProfileFormProps) => {
  const [loading, setLoading] = useState(!!profileId);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    profile_name: "",
    age_range: "",
    location: "",
    profession: "",
    income_level: "",
    pain_points: [] as string[],
    goals: [] as string[],
    values: [] as string[],
    content_consumption_habits: "",
    time_availability: "",
    preferred_platforms: [] as string[],
    buying_patterns: "",
    current_state: "",
    desired_state: "",
    solution_approach: "",
    unique_angle: "",
    proof_points: [] as string[],
    value_proposition: "",
  });

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("audience_profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          profile_name: data.profile_name || "",
          age_range: data.age_range || "",
          location: data.location || "",
          profession: data.profession || "",
          income_level: data.income_level || "",
          pain_points: data.pain_points || [],
          goals: data.goals || [],
          values: data.values || [],
          content_consumption_habits: data.content_consumption_habits || "",
          time_availability: data.time_availability || "",
          preferred_platforms: data.preferred_platforms || [],
          buying_patterns: data.buying_patterns || "",
          current_state: data.current_state || "",
          desired_state: data.desired_state || "",
          solution_approach: data.solution_approach || "",
          unique_angle: data.unique_angle || "",
          proof_points: data.proof_points || [],
          value_proposition: data.value_proposition || "",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.profile_name.trim()) {
      toast.error("Please enter a profile name");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        ...formData,
      };

      if (profileId) {
        const { error } = await supabase
          .from("audience_profiles")
          .update(payload)
          .eq("id", profileId);

        if (error) throw error;
        toast.success("Profile updated successfully!");
      } else {
        const { error } = await supabase
          .from("audience_profiles")
          .insert(payload);

        if (error) throw error;
        toast.success("Profile created successfully!");
      }

      onSuccess();
    } catch (error: any) {
      toast.error("Failed to save profile");
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
        <CardTitle>{profileId ? "Edit" : "New"} Audience Profile</CardTitle>
        <CardDescription>
          Define your ideal customer profile for targeted content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Profile Name *</Label>
          <Input
            id="profile-name"
            placeholder="e.g., Part-time Developer Entrepreneurs"
            value={formData.profile_name}
            onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
          />
        </div>

        <Separator />
        <div className="space-y-4">
          <h3 className="font-semibold">Demographics</h3>
          
          <div className="space-y-2">
            <Label htmlFor="age-range">Age Range</Label>
            <Input
              id="age-range"
              placeholder="e.g., 25-45 years old"
              value={formData.age_range}
              onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., US, Europe, Global"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              placeholder="e.g., Full-time programmers"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-level">Income Level</Label>
            <Input
              id="income-level"
              placeholder="e.g., $80k-150k/year"
              value={formData.income_level}
              onChange={(e) => setFormData({ ...formData, income_level: e.target.value })}
            />
          </div>
        </div>

        <Separator />
        <div className="space-y-4">
          <h3 className="font-semibold">Psychographics</h3>
          
          <div className="space-y-2">
            <Label htmlFor="pain-points">Pain Points</Label>
            <Textarea
              id="pain-points"
              placeholder="Enter pain points, one per line"
              value={formData.pain_points.join("\n")}
              onChange={(e) => setFormData({ ...formData, pain_points: e.target.value.split("\n").filter(p => p.trim()) })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              placeholder="Enter goals, one per line"
              value={formData.goals.join("\n")}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value.split("\n").filter(g => g.trim()) })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="values">Values</Label>
            <Textarea
              id="values"
              placeholder="Enter values, one per line"
              value={formData.values.join("\n")}
              onChange={(e) => setFormData({ ...formData, values: e.target.value.split("\n").filter(v => v.trim()) })}
              rows={3}
            />
          </div>
        </div>

        <Separator />
        <div className="space-y-4">
          <h3 className="font-semibold">Transformation</h3>
          
          <div className="space-y-2">
            <Label htmlFor="current-state">Current State (From)</Label>
            <Textarea
              id="current-state"
              placeholder="Describe where your audience is now..."
              value={formData.current_state}
              onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired-state">Desired State (To)</Label>
            <Textarea
              id="desired-state"
              placeholder="Describe where they want to be..."
              value={formData.desired_state}
              onChange={(e) => setFormData({ ...formData, desired_state: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution-approach">Your Solution (How)</Label>
            <Textarea
              id="solution-approach"
              placeholder="Describe how you help them get there..."
              value={formData.solution_approach}
              onChange={(e) => setFormData({ ...formData, solution_approach: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <Separator />
        <div className="space-y-4">
          <h3 className="font-semibold">Positioning</h3>
          
          <div className="space-y-2">
            <Label htmlFor="unique-angle">Your Unique Angle (Why You)</Label>
            <Textarea
              id="unique-angle"
              placeholder="What makes your approach different?"
              value={formData.unique_angle}
              onChange={(e) => setFormData({ ...formData, unique_angle: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof-points">Proof Points</Label>
            <Textarea
              id="proof-points"
              placeholder="Enter your credibility markers, one per line"
              value={formData.proof_points.join("\n")}
              onChange={(e) => setFormData({ ...formData, proof_points: e.target.value.split("\n").filter(p => p.trim()) })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value-proposition">Value Proposition</Label>
            <Textarea
              id="value-proposition"
              placeholder="Your promise to the audience..."
              value={formData.value_proposition}
              onChange={(e) => setFormData({ ...formData, value_proposition: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
