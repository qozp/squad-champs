import type { Route } from "../+types/root";
import { Link, useLoaderData } from "react-router";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Trophy,
  DollarSign,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { containsBadWords, sanitizeInput } from "~/lib/moderation";
import { requireAuth } from "~/lib/requireAuth";
import { supabaseBrowser } from "~/lib/supabase/client";
import { useEffect, useState } from "react";
import CreateProfileForm from "~/components/profile/CreateProfileForm";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home - Squad Champs" },
    {
      name: "description",
      content:
        "Create and manage your NBA and NFL fantasy squads, compete with friends, and track live player stats.",
    },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function Home() {
  const { user } = useLoaderData<typeof loader>();
  const [profile, setProfile] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabaseBrowser.rpc("get_profile", {
        user_id: user.id,
      });

      if (error) throw error;

      setProfile(data[0]);
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
        <p className="text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* CTA Section */}
      <section className="py-16 text-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-foreground mb-8 text-lg">
            Start building your championship squad today
          </p>
          <Link to="/squad">
            <Button size="lg" variant="default">
              Manage Your Squad
            </Button>
          </Link>
        </div>
      </section>

      <hr className="border border-border w-1/2 mx-auto transition-colors duration-300" />

      {/* Features Section */}
      <section className="py-12 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Trophy className="h-6 w-6 text-secondary" />,
                title: "Create and Join Leagues",
                desc: "Play against friends and family, colleagues, or anybody in leagues and cups. ",
              },
              {
                icon: <Users className="h-6 w-6 text-secondary" />,
                title: "Squad Building",
                desc: "Use your budget of $100 to build a fantasy squad of 13 NBA players. Manage in-season with weekly line-ups and trades.",
              },
              {
                icon: <DollarSign className="h-6 w-6 text-secondary" />,
                title: "Prizes",
                desc: "Earn rewards for being the top weekly and/or seasonal scorer. Participation is completely free.",
              },
            ].map((f, i) => (
              <Card
                key={i}
                className="border border-border bg-card text-card-foreground transition-colors duration-300"
              >
                <CardContent className="p-6 text-left">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center bg-background">
                    {f.icon}
                  </div>
                  <h3 className="text-xl text-foreground font-semibold mb-2">
                    {f.title}
                  </h3>
                  <p className="text-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <CreateProfileForm
        open={showDialog}
        onClose={() => {
          toast.warning("Please create a profile to continue.", {
            description: "Finish setting up your account.",
            duration: 6000,
          });
        }}
        profileData={profile}
      />
    </div>
  );
}
