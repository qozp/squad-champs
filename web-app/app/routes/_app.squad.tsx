import { useLoaderData } from "react-router";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";

export function meta() {
  return [
    { title: "My Squad - Squad Champs" },
    { name: "description", content: "View and manage your fantasy squad." },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function SquadPage() {
  useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen text-foreground">
      <section className="container mx-auto px-10 py-10">
        <h1 className="text-4xl font-bold mb-6">My Squad</h1>
        <p className="text-lg text-foreground">
          Manage your players and track your performance.
        </p>
      </section>
    </div>
  );
}
