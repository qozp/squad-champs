import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import CreateProfileForm from "~/components/profile/CreateProfileForm";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/requireAuth";
import { supabaseBrowser } from "~/lib/supabase/client";
import { createSupabaseClient } from "~/lib/supabase/server";
import type { Route } from "../+types/root";
import { sanitizeInput } from "~/lib/moderation";

export function meta() {
  return [
    { title: "Profile - Squad Champs" },
    { name: "description", content: "Browse and edit your profile." },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const [showDialog, setShowDialog] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabaseBrowser.rpc("get_user_profile", {});

      if (error) throw error;

      const profileRow = data?.[0] ?? null;
      setProfile(profileRow);
      // Open create form if profile doesn’t exist
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    // wait for profile to load
    return (
      <p className="flex flex-1 min-h-screen items-center justify-center text-lg text-foreground">
        Loading Profile...
      </p>
    );
  }

  // Define fields dynamically
  const profileFields: { label: string; value?: string | null }[] = [
    { label: "Email", value: user?.email },
    { label: "Display Name", value: sanitizeInput(profile?.display_name) },
    { label: "First Name", value: profile?.first_name },
    { label: "Last Name", value: profile?.last_name },
    { label: "Nation", value: profile?.nation },
    { label: "State", value: profile?.state },
  ];

  return (
    <div className="text-foreground m-4">
      <section className="p-4">
        <h1 className="text-4xl font-bold p-2">Profile</h1>
        {/* Divider between sections */}
        <hr className="border border-border w-full transition-colors duration-300 mb-2" />

        <div className="text-lg text-foreground space-y-2">
          {profileFields.map((field) => (
            <p key={field.label}>
              <strong>{field.label}:</strong> {field.value ?? "Not set"}
            </p>
          ))}
        </div>
        <div className="mt-3">
          <Button onClick={() => setShowDialog(true)}>Update Profile</Button>
        </div>
        <CreateProfileForm
          open={showDialog}
          onClose={() => setShowDialog(false)}
          profileData={profile ?? {}}
        />
      </section>
    </div>
  );
}
