import { useLoaderData } from "react-router";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";
import PlayersTableForSquad from "~/components/squad/PlayersTableForSquad";
import { useState, useEffect } from "react";
import CreateSquadForm from "~/components/squad/SquadNameForm";
import { supabaseBrowser } from "~/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { sanitizeInput } from "~/lib/moderation";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import SquadPlayersPanel from "~/components/squad/SquadPlayersPanel";
import type { PlayerBasic } from "~/lib/types/squad";
import LineupEditor from "~/components/squad/LineupEditor/LineupEditor";

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
  const [squadMeta, setSquadMeta] = useState<any | null>(null); // squad metadata
  const [squadPlayers, setSquadPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playersMap, setPlayersMap] = useState<Record<number, PlayerBasic>>({});
  const [squadBudget, setSquadBudget] = useState<number>(0);

  const [showDialog, setShowDialog] = useState(false);

  const fetchSquad = async () => {
    try {
      const { data: squadData } = await supabaseBrowser.rpc("get_squad");
      setSquadMeta(squadData?.[0] ?? null);
      setSquadBudget(squadData?.[0].budget);

      // Existing squad players
      const { data: squadPlayerData } = await supabaseBrowser.rpc(
        "get_squad_players_by_user"
      );
      setSquadPlayers(squadPlayerData || []);

      // All players: for players table
      const { data: allPlayers } = await supabaseBrowser
        .from("player")
        .select("id, pos, price, first_name, last_name");

      const map: Record<number, PlayerBasic> = {};
      allPlayers?.forEach((p) => {
        map[p.id] = {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          pos: p.pos as PlayerBasic["pos"],
          price: p.price,
        };
      });
      setPlayersMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquad();
  }, []);

  function addPlayer(id: number) {
    const player = playersMap[id];
    if (!player) return;

    setSquadBudget((prev) => prev - player.price);
    setSelectedPlayers((prev) => [...prev, id]);
  }

  function removePlayer(id: number) {
    const player = playersMap[id];
    if (!player) return;

    setSquadBudget((prev) => prev + player.price);
    setSelectedPlayers((p) => p.filter((x) => x !== id));
  }

  function removeAll() {
    // restore full budget
    let restored = 0;
    selectedPlayers.forEach((id) => {
      const p = playersMap[id];
      if (p) restored += p.price;
    });

    setSquadBudget((prev) => prev + restored);
    setSelectedPlayers([]);
  }

  const getPositionCounts = () => {
    const counts = { Guard: 0, Forward: 0, Center: 0 };

    selectedPlayers.forEach((id) => {
      const p = playersMap[id];
      if (p) counts[p.pos] += 1;
    });

    return counts;
  };

  const submitSquad = async () => {
    if (selectedPlayers.length !== 13) {
      toast.error("You must select exactly 13 players.");
      return;
    }

    const { error } = await supabaseBrowser.rpc("create_full_squad", {
      p_player_ids: selectedPlayers,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Squad successfully created!");
    await fetchSquad();
  };

  const counts = getPositionCounts();
  const isValidSquad =
    selectedPlayers.length === 13 &&
    counts.Guard === 5 &&
    counts.Forward === 5 &&
    counts.Center === 3 &&
    squadBudget >= 0;

  if (loading) {
    // wait for squad to load
    return (
      <p className="flex flex-1 min-h-screen items-center justify-center text-lg text-foreground">
        Loading Squad...
      </p>
    );
  }

  const hasSquad = !!squadMeta;
  const hasExistingPlayers = squadPlayers.length > 0;
  const creatingNewSquad = hasSquad && !hasExistingPlayers;

  const mode: "create" | "edit" = creatingNewSquad ? "create" : "edit";

  return (
    <div className="space-y-4 lg:flex lg:space-x-4 lg:space-y-0 flex-row flex-1 text-foreground m-4">
      <Card className="flex-1 lg:w-1/2">
        <CardContent className="">
          <CardTitle className="">
            {creatingNewSquad ? "Create" : "Edit"} Squad
          </CardTitle>
          {squadMeta && (
            <div>
              <div className="flex flex-row space-x-1 justify-between items-center">
                <div className="flex items-center space-x-2">
                  <p className="flex items-center">
                    <strong className="mr-1">Name:</strong>{" "}
                    {sanitizeInput(squadMeta.name)}
                  </p>

                  <Button
                    onClick={() => setShowDialog(true)}
                    className="text-muted-foreground hover:text-foreground transition cursor-pointer"
                    aria-label="Edit squad name"
                  >
                    <Pencil size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-row space-x-1 justify-between items-center">
                <p>
                  <strong>Total Points:</strong> {squadMeta.total_points}
                </p>
                <p>
                  <strong>Remaining Budget:</strong> ${squadBudget}
                </p>
              </div>
            </div>
          )}

          {/* Show different UI based on mode */}
          {mode === "create" ? (
            <>
              <SquadPlayersPanel
                mode="create"
                players={selectedPlayers.map((id) => playersMap[id])}
                onRemove={removePlayer}
              />

              <div className="mt-4 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={removeAll}
                  disabled={selectedPlayers.length === 0}
                >
                  Remove All
                </Button>

                <Button
                  onClick={submitSquad}
                  disabled={selectedPlayers.length !== 13}
                >
                  Create Squad
                </Button>
              </div>
            </>
          ) : (
            // EDIT MODE: LINEUP EDITOR
            <LineupEditor initialPlayers={squadPlayers} />
          )}
        </CardContent>
      </Card>
      {/* RIGHT CARD (Only used in create mode) */}
      {mode === "create" && (
        <Card className="lg:w-1/2">
          <CardContent>
            <CardTitle>Add Players</CardTitle>

            <PlayersTableForSquad
              mode="create"
              selected={selectedPlayers}
              playersMap={playersMap}
              budget={squadBudget}
              onAddPlayer={addPlayer}
            />
          </CardContent>
        </Card>
      )}
      <CreateSquadForm
        open={showDialog}
        onClose={() => setShowDialog(false)}
        userId={user.id}
        squadName={squadMeta?.name}
      />
    </div>
  );
}
