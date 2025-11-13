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
import { Card, CardContent, CardTitle } from "~/components/ui/card";

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

export default function Squad() {
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
      <p className="flex flex-1 items-center justify-center text-lg text-foreground">
        Loading Squad...
      </p>
    );
  }

  return (
    <div className="space-y-4 md:flex md:space-x-4 md:space-y-0 flex-row flex-1 text-foreground m-4">
      <Card className="flex-1">
        <CardContent className="">
          <CardTitle className="">My Squad</CardTitle>
          <p className="text-lg text-foreground">
            Manage your players and track your performance.
          </p>
          {/* Show squad name if exists */}
          <div className="items-center space-y-1">
            <p>
              <strong>Squad Name: </strong>{" "}
              {sanitizeInput(squad?.name) ?? "Not set"}
            </p>
            <p>
              <strong>Total Points: </strong> {squad?.total_points ?? "0"}
            </p>
          </div>
          {/* Button to open Create / Update Squad Form */}
          <Button onClick={() => setShowDialog(true)}>
            {squad ? "Update Name" : "Create Squad"}
          </Button>
          <CurrentSquad />
        </CardContent>
      </Card>
      <Card className="">
        <CardContent className="">
          <CardTitle className="">Add Players</CardTitle>
          <SquadPlayersTable />
        </CardContent>
      </Card>
      <CreateSquadForm
        open={showDialog}
        onClose={() => setShowDialog(false)}
        userId={user.id}
        squadName={squad?.name}
      />
    </div>
  );
}
