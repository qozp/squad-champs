import { useLoaderData } from "react-router";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import { toast } from "sonner";

import SquadMetadata from "~/components/squad/SquadMetadata";
import CreateSquad from "~/components/squad/CreateSquad";
import ViewSquad from "~/components/squad/viewSquad/ViewSquad";
import SquadNameForm from "~/components/squad/SquadNameForm";
import type { PlayerBasic } from "~/lib/types/squad";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function SquadPage() {
  const { user } = useLoaderData<typeof loader>();

  const [loading, setLoading] = useState(true);
  const [squadMeta, setSquadMeta] = useState<any | null>(null);
  const [squadPlayers, setSquadPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playersMap, setPlayersMap] = useState<Record<number, PlayerBasic>>({});
  const [budget, setBudget] = useState<number>(0);
  const [showDialog, setShowDialog] = useState(false);

  const fetchSquad = async () => {
    try {
      const { data: squadData } = await supabaseBrowser.rpc("get_squad");
      const meta = squadData?.[0] ?? null;

      setSquadMeta(meta);
      setBudget(meta?.budget ?? 0);

      const { data: squadPlayerData } = await supabaseBrowser.rpc(
        "get_squad_players_by_user"
      );
      setSquadPlayers(squadPlayerData || []);

      const { data: allPlayers } = await supabaseBrowser
        .from("player")
        .select("id, pos, price, first_name, last_name");

      const map: Record<number, PlayerBasic> = {};
      allPlayers?.forEach((p) => (map[p.id] = p));
      setPlayersMap(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquad();
  }, []);

  // -------------------------
  // Handlers
  // -------------------------

  const addPlayer = (id: number) => {
    const p = playersMap[id];
    if (!p) return;
    setBudget((b) => b - p.price);
    setSelectedPlayers((prev) => [...prev, id]);
  };

  const removePlayer = (id: number) => {
    const p = playersMap[id];
    if (!p) return;
    setBudget((b) => b + p.price);
    setSelectedPlayers((prev) => prev.filter((x) => x !== id));
  };

  const removeAll = () => {
    let totalRefund = selectedPlayers.reduce(
      (acc, id) => acc + (playersMap[id]?.price || 0),
      0
    );
    setBudget((b) => b + totalRefund);
    setSelectedPlayers([]);
  };

  const submitSquad = async () => {
    if (selectedPlayers.length !== 13) {
      toast.error("Select 13 players.");
      return;
    }
    const { error } = await supabaseBrowser.rpc("create_full_squad", {
      p_player_ids: selectedPlayers,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Squad created!");
    await fetchSquad();
  };

  // -------------------------

  const hasSquad = !!squadMeta;
  const hasPlayers = squadPlayers.length > 0;
  const mode: "create" | "edit" = hasSquad && !hasPlayers ? "create" : "edit";

  if (loading) {
    return (
      <p className="flex min-h-screen items-center justify-center text-lg">
        Loading Squad...
      </p>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <SquadMetadata
        squadMeta={squadMeta}
        budget={budget}
        onEditName={() => setShowDialog(true)}
      />

      {mode === "create" ? (
        <CreateSquad
          selectedPlayers={selectedPlayers}
          playersMap={playersMap}
          budget={budget}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onRemoveAll={removeAll}
          onSubmit={submitSquad}
        />
      ) : (
        <ViewSquad squadPlayers={squadPlayers} squadMeta={squadMeta} />
      )}

      <SquadNameForm
        open={showDialog}
        onClose={() => setShowDialog(false)}
        userId={user.id}
        squadName={squadMeta?.name}
      />
    </div>
  );
}
