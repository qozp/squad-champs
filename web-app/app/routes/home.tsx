import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ArrowRight, TrendingUp, Users, Trophy } from "lucide-react";
import { Button } from "app/components/ui/button";
import { Card, CardContent } from "app/components/ui/card";
import Navbar from "app/components/Navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home() {
  // const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 bg-blue-600 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="mb-6 text-5xl font-bold sm:text-6xl lg:text-7xl">
            Squad Champs
          </h1>
          <p className="mb-8 text-xl sm:text-2xl text-white/90">
            Build your NBA fantasy squad and compete globally and with friends!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
            >
              <Link to="/squad">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
            >
              <Link to="/players">Browse Players</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6 text-primary" />,
                title: "Squad Management",
                desc: "Build and manage your fantasy squad with real-time player stats and performance tracking.",
              },
              {
                icon: <Trophy className="h-6 w-6 text-primary" />,
                title: "League Competition",
                desc: "Create or join leagues, compete with friends, and climb the leaderboard to claim victory.",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-primary" />,
                title: "Live Stats",
                desc: "Track player performance with detailed stats, trends, and insights to make informed decisions.",
              },
            ].map((f, i) => (
              <Card
                key={i}
                className="border border-border transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center bg-primary/10">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground dark:text-gray-300">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-100">
            Ready to dominate?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg dark:text-gray-300">
            Start building your championship squad today
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <Link to="/squad">Create Your Squad</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
