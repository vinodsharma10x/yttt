import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Star } from "lucide-react";
import { AudienceProfileForm } from "./AudienceProfileForm";

interface AudienceProfile {
  id: string;
  profile_name: string;
  is_primary: boolean;
  age_range?: string;
  profession?: string;
  current_state?: string;
  desired_state?: string;
  unique_angle?: string;
}

interface AudienceProfilesProps {
  userId: string;
}

export const AudienceProfiles = ({ userId }: AudienceProfilesProps) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<AudienceProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("audience_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast.error("Failed to load audience profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this audience profile?")) return;

    try {
      const { error } = await supabase
        .from("audience_profiles")
        .delete()
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Profile deleted successfully");
      loadProfiles();
    } catch (error: any) {
      toast.error("Failed to delete profile");
    }
  };

  const handleSetPrimary = async (profileId: string) => {
    try {
      // First, set all profiles to non-primary
      await supabase
        .from("audience_profiles")
        .update({ is_primary: false })
        .eq("user_id", userId);

      // Then set the selected one as primary
      const { error } = await supabase
        .from("audience_profiles")
        .update({ is_primary: true })
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Primary profile updated");
      loadProfiles();
    } catch (error: any) {
      toast.error("Failed to update primary profile");
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Audience Profiles (ICP)</CardTitle>
              <CardDescription>
                Define your ideal customer profiles for targeted content generation
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showNewForm && (
        <AudienceProfileForm
          userId={userId}
          onSuccess={() => {
            setShowNewForm(false);
            loadProfiles();
          }}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      {profiles.map((profile) => (
        editingProfile === profile.id ? (
          <AudienceProfileForm
            key={profile.id}
            userId={userId}
            profileId={profile.id}
            onSuccess={() => {
              setEditingProfile(null);
              loadProfiles();
            }}
            onCancel={() => setEditingProfile(null)}
          />
        ) : (
          <Card key={profile.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{profile.profile_name}</CardTitle>
                    {profile.is_primary && (
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    )}
                  </div>
                  {profile.age_range && (
                    <p className="text-sm text-muted-foreground">Age: {profile.age_range}</p>
                  )}
                  {profile.profession && (
                    <p className="text-sm text-muted-foreground">Profession: {profile.profession}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!profile.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(profile.id)}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile(profile.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(profile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.current_state && (
                <div>
                  <p className="text-sm font-medium">Current State:</p>
                  <p className="text-sm text-muted-foreground">{profile.current_state}</p>
                </div>
              )}
              {profile.desired_state && (
                <div>
                  <p className="text-sm font-medium">Desired State:</p>
                  <p className="text-sm text-muted-foreground">{profile.desired_state}</p>
                </div>
              )}
              {profile.unique_angle && (
                <div>
                  <p className="text-sm font-medium">Your Unique Angle:</p>
                  <p className="text-sm text-muted-foreground">{profile.unique_angle}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      ))}

      {profiles.length === 0 && !showNewForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No audience profiles yet. Create your first one to get started!
            </p>
            <Button onClick={() => setShowNewForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Audience Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
