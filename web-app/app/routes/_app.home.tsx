import type { Route } from "../+types/root";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/requireAuth";
import FeatureCarousel from "~/components/home/FeatureCarousel";

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

  return (
    <div className="flex-1 bg-background text-foreground transition-colors duration-300">
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
      <section className="flex flex-1 justify-center py-12 transition-colors duration-300">
        <div className="flex flex-col justify-center w-full">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Key Features
          </h2>
          <FeatureCarousel />
        </div>
      </section>
    </div>
  );
}
