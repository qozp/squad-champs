import { useState, useEffect } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import CreateProfileForm from "~/components/profile/CreateProfileForm";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/requireAuth";
import { createClient } from "~/lib/supabase/server";

export const loader = async ({
  request,
  context,
}: LoaderFunctionArgs & { context: any }) => {
  const user = await requireAuth(request);
  const { supabase } = createClient(request, context.env);

  const { data: profileData, error } = await supabase.rpc("get_profile", {
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  return { user, profile: profileData };
};

export default function ProfilePage() {
  const { user, profile } = useLoaderData<typeof loader>();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (profile.length == 0) {
      setShowDialog(true);
    }
  }, [profile]);

  // profileData is the first row of the array or empty object
  const profileData = profile?.[0] ?? {};

  // Define fields dynamically
  const profileFields: { label: string; value?: string | null }[] = [
    { label: "Email", value: user?.email },
    // { label: "User ID", value: user?.id },
    { label: "Display Name", value: profileData.display_name },
    { label: "First Name", value: profileData.first_name },
    { label: "Last Name", value: profileData.last_name },
    { label: "Nation", value: profileData.nation },
    { label: "State", value: profileData.state },
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
          profileData={profileData}
        />
      </section>
    </div>
  );
}
