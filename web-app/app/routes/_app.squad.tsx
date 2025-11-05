import { useLoaderData } from "react-router";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";
import PlayersTable from "~/components/players/PlayersTable";
import SquadPlayersTable from "~/components/squad/SquadPlayersTable";
import CurrentSquad from "~/components/squad/CurrentSquad";
import { useState, useEffect } from "react";
import CreateSquadForm from "~/components/squad/CreateSquadForm";
import { supabaseBrowser } from "~/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { sanitizeInput } from "~/lib/moderation";

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
  const { user } = useLoaderData<typeof loader>();
  const [loading, setLoading] = useState(true);
  const [squad, setSquad] = useState<any | null>(null);

  const [showDialog, setShowDialog] = useState(false);

  const fetchSquad = async () => {
    try {
      const { data: squadData, error: squadError } =
        await supabaseBrowser.rpc("get_squad");
      console.log(squadData);
      if (squadError) throw squadError;
      setSquad(squadData[0]);

      if (!squadData || squadData.length === 0) setShowDialog(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquad();
  }, []);

  // useEffect(() => {
  //   if (!squad) {
  //     setShowDialog(true);
  //   }
  // }, [squad]);

  if (loading) {
    // wait for squad to load
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-foreground">Loading Squad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <section className="p-10 space-y-4">
        <h1 className="text-4xl font-bold mb-6">My Squad</h1>
        <p className="text-lg text-foreground">
          Manage your players and track your performance.
        </p>
        {/* Show squad name if exists */}
        <div className="flex items-center">
          <p>
            <strong>Squad Name: </strong>{" "}
            {sanitizeInput(squad?.name) ?? "Not set"}
          </p>
        </div>
        {/* Button to open Create / Update Squad Form */}
        <Button onClick={() => setShowDialog(true)}>
          {squad ? "Update Name" : "Create Squad"}
        </Button>
        <CurrentSquad />
      </section>

      <section className="p-10">
        <h2 className="text-2xl font-semibold mb-4">Add Players</h2>
        <SquadPlayersTable />
      </section>
      <CreateSquadForm
        open={showDialog}
        onClose={() => setShowDialog(false)}
        userId={user.id}
        squadName={squad?.name}
      />
    </div>
  );
}
