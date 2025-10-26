import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Players - Squad Champs" },
    { name: "description", content: "Browse and view player stats." },
  ];
}

export default function Players() {
  return (
    <div className="min-h-screen text-foreground">
      <section className="container px-4 py-4">
        <h1 className="text-4xl font-bold mb-8">Browse Players</h1>
        <p className="mb-6">
          Explore the top NBA players, their stats, and add them to your fantasy
          squad.
        </p>
        <Card className="max-w-lg bg-card border border-border">
          <CardContent className="p-6 text-center">
            <p>Player list coming soon...</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
