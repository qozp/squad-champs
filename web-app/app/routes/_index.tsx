import type { Route } from "../+types/root";
import { Link } from "react-router";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Trophy,
  DollarSign,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Squad Champs – Build Your NBA/NFL Fantasy Team" },
    {
      name: "description",
      content:
        "Create and manage your NBA and NFL fantasy squads, compete with friends, and track live player stats.",
    },
    {
      name: "keywords",
      content:
        "fantasy basketball, fantasy football, NBA, NFL, fantasy sports, leagues, squads, live stats",
    },
    { name: "author", content: "Squad Champs Team" },

    // Open Graph (for social media sharing)
    {
      property: "og:title",
      content: "Squad Champs – Build Your NBA/NFL Fantasy Team",
    },
    {
      property: "og:description",
      content:
        "Create and manage your NBA and NFL fantasy squads, compete with friends, and track live player stats.",
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
      content: "Squad Champs – Build Your NBA/NFL Fantasy Team",
    },
    {
      name: "twitter:description",
      content:
        "Create and manage your NBA and NFL fantasy squads, compete with friends, and track live player stats.",
    },
    {
      name: "twitter:image",
      content: "https://squadchamps.com/public/logo.svg",
    }, // optional
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-10 relative overflow-hidden text-primary-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold">Squad Champs</h1>
          <p className="mb-8 text-xl text-foreground/90">
            Build your NBA fantasy squad and compete globally and with friends!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/squad">
              <Button size="lg" variant="default">
                Get Started
              </Button>
            </Link>
            <Link to="/players">
              <Button size="lg" variant="default">
                Browse Players
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
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6 text-secondary" />,
                title: "Squad Management",
                desc: "Build your fantasy squad under a budget, manage with trades, and start a weekly lineup.",
              },
              {
                icon: <Trophy className="h-6 w-6 text-secondary" />,
                title: "League Competition",
                desc: "Create or join leagues, compete with friends, and climb the global leaderboard.",
              },
              {
                icon: <DollarSign className="h-6 w-6 text-secondary" />,
                title: "Prizes",
                desc: "Earn rewards for being the top weekly and/or seasonal scorer. Partipation is completely free.",
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

      <hr className="border border-border w-1/2 mx-auto transition-colors duration-300" />

      {/* CTA Section */}
      <section className="py-16 text-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to dominate?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start building your championship squad today
          </p>
          <Button size="lg" variant="default">
            <Link to="/squad">Create Your Squad</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
