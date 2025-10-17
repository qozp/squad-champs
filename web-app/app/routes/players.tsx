import { Card, CardContent } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import Navbar from "app/components/Navbar";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Players - Squad Champs" },
    { name: "description", content: "Browse and view player stats." },
  ];
}

export default function Players() {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Browse Players</h1>
        <p className="mb-6">
          Explore the top NBA players, their stats, and add them to your fantasy
          squad.
        </p>
        <Card className="max-w-lg mx-auto bg-white dark:bg-gray-800 border border-border">
          <CardContent className="p-6 text-center">
            <p>Player list coming soon...</p>
            <Button asChild className="mt-6">
              <Link to="/squad">Build Your Squad</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
