import type { Route } from "../+types/root";
import { Link, redirect } from "react-router";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Trophy,
  DollarSign,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { createSupabaseClient } from "~/lib/supabase/server";
import FeatureCarousel from "~/components/home/FeatureCarousel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Squad Champs – Build Your NBA Fantasy Team" },
    {
      name: "description",
      content:
        "Create and manage your NBA fantasy squads, compete with friends, and track live player stats.",
    },
    {
      name: "keywords",
      content:
        "fantasy basketball, fantasy football, NBA, fantasy sports, leagues, squads, live stats",
    },
    { name: "author", content: "Squad Champs Team" },

    // Open Graph (for social media sharing)
    {
      property: "og:title",
      content: "Squad Champs – Build Your NBA Fantasy Team",
    },
    {
      property: "og:description",
      content:
        "Create and manage your NBA fantasy squads, compete with friends, and track live player stats.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://squadchamps.com" },
    {
      property: "og:image",
      content: "https://squadchamps.com/public/logo.svg",
    },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "Squad Champs – Build Your NBA Fantasy Team",
    },
    {
      name: "twitter:description",
      content:
        "Create and manage your NBA fantasy squads, compete with friends, and track live player stats.",
    },
    {
      name: "twitter:image",
      content: "https://squadchamps.com/public/logo.svg",
    }, // optional
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { supabase } = createSupabaseClient(request);
  const { data, error } = await supabase.auth.getUser();

  if (error) return;
  if (data?.user) {
    return redirect("/home");
  }

  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home() {
  return (
    <div className="flex-1 bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-10 relative overflow-hidden text-primary-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold">Squad Champs</h1>
          <p className="mb-8 text-xl text-foreground/90">
            Build your NBA fantasy squad and compete globally and with friends!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" variant="default">
                Sign Up
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="default">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider between sections */}
      <hr className="border border-border w-1/2 mx-auto transition-colors duration-300" />

      {/* Features Section */}
      <section className="py-12 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Key Features
          </h2>
          <FeatureCarousel />
        </div>
      </section>

      <hr className="border border-border w-1/2 mx-auto transition-colors duration-300" />

      {/* CTA Section */}
      <section className="py-16 text-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need More Info?</h2>
          <p className="text-foreground mb-6 text-lg">
            Visit our in-depth help page
          </p>
          <Link to="/help">
            <Button size="lg" variant="default">
              Rules & FAQs
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
