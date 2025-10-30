import { useState, useEffect } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import CreateProfileForm from "~/components/profile/CreateProfileForm";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/requireAuth";
import { createClient } from "~/lib/supabase/client";
import { createSupabaseClient } from "~/lib/supabase/server";

export function meta() {
  return [
    { title: "Profile - Squad Champs" },
    { name: "description", content: "Browse and edit your profile." },
  ];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const [showDialog, setShowDialog] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc("get_profile", {
        user_id: user.id,
      });
      console.log(data[0]);

      if (error) throw error;

      setProfile(data[0]);

      // Open create form if profile doesn’t exist
      if (!data || data.length === 0) setShowDialog(true);
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-foreground">Loading profile...</p>
      </div>
    );
  }

  // Define fields dynamically
  const profileFields: { label: string; value?: string | null }[] = [
    { label: "Email", value: user?.email },
    { label: "Display Name", value: profile?.display_name },
    { label: "First Name", value: profile?.first_name },
    { label: "Last Name", value: profile?.last_name },
    { label: "Nation", value: profile?.nation },
    { label: "State", value: profile?.state },
  ];

  return (
    <div className="min-h-screen text-foreground">
      <section className="container px-10 py-10">
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
          profileData={profile}
        />
      </section>
    </div>
  );
}
