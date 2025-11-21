import { useLoaderData } from "react-router";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import { toast } from "sonner";

import SquadMetadata from "~/components/squad/SquadMetadata";
import CreateSquad from "~/components/squad/CreateSquad";
import SquadNameForm from "~/components/squad/SquadNameForm";
import type { PlayerBasic, SquadPlayer } from "~/lib/types/squad";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import TradesTab from "~/components/squad/TradesTab";
import LineupTab from "~/components/squad/LineupTab";
import ScoresTab from "~/components/squad/ScoresTab";

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
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);

  const fetchSquad = async () => {
    try {
      const { data: squadData } = await supabaseBrowser.rpc("get_squad");
      const meta = squadData?.[0] ?? null;
      console.log(meta);

      setSquadMeta(meta);
      setBudget(meta?.budget ?? 0);

      const { data: squadPlayerData } = await supabaseBrowser.rpc(
        "get_squad_players_by_user"
      );
      setSquadPlayers(squadPlayerData || []);

      const { data: allPlayers } = await supabaseBrowser
        .from("player")
        .select("id, pos, current_price, first_name, last_name");

      type PlayerRow = {
        id: number; // from the DB
        pos: "Guard" | "Forward" | "Center";
        current_price: number;
        first_name: string;
        last_name: string;
      };

      const map: Record<number, PlayerBasic> = {};

      if (!allPlayers) return;
      allPlayers.forEach((p: PlayerRow) => {
        map[p.id] = {
          player_id: p.id, // normalize here
          first_name: p.first_name,
          last_name: p.last_name,
          pos: p.pos,
          current_price: p.current_price,
        };
      });
      setPlayersMap(map);
    } finally {
      setLoading(false);
    }
  };

  async function fetchCurrentGameweek() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data } = await supabaseBrowser
      .from("gameweek")
      .select("gameweek, start_date, end_date")
      .lte("start_date", today)
      .gte("end_date", today)
      .maybeSingle();

    if (data) setCurrentGameweek(data.gameweek);
  }

  useEffect(() => {
    fetchSquad();
    fetchCurrentGameweek();
  }, []);

  // -------------------------
  // Handlers
  // -------------------------

  const addPlayer = (id: number) => {
    const p = playersMap[id];
    if (!p) return;
    setBudget((b) => b - p.current_price);
    setSelectedPlayers((prev) => [...prev, id]);
    toast.success(`${p.first_name} ${p.last_name} added to your squad.`);
  };

  const removePlayer = (id: number) => {
    const p = playersMap[id];
    if (!p) return;
    setBudget((b) => b + p.current_price);
    setSelectedPlayers((prev) => prev.filter((x) => x !== id));
  };

  const removeAll = () => {
    let totalRefund = selectedPlayers.reduce(
      (acc, id) => acc + (playersMap[id]?.current_price || 0),
      0
    );
    setBudget((b) => b + totalRefund);
    setSelectedPlayers([]);
    toast.success("Changes discarded.");
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

  async function submitTrade({
    rowsOut,
    rowsIn,
  }: {
    rowsOut: number[];
    rowsIn: number[];
  }) {
    try {
      // Validate before calling RPC
      if (rowsOut.length === 0 && rowsIn.length === 0) {
        toast.error("No trades to submit.");
        return;
      }

      const { error } = await supabaseBrowser.rpc("submit_trades", {
        p_rows_out: rowsOut,
        p_rows_in: rowsIn,
      });

      if (error) {
        console.error("RPC submit_trades error:", error);
        toast.error(error.message ?? "Trade submission failed.");
        return;
      }

      await fetchSquad();
      toast.success("Trades submitted successfully!");
    } catch (err: any) {
      console.error("Unexpected trade error:", err);
      toast.error(err.message ?? "Unexpected error submitting trades.");
    }
  }

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
        currentGameweek={currentGameweek}
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
        <Tabs defaultValue="lineup" className="w-full">
          {/* TABS OUTSIDE CARD */}
          <TabsList className="mb-2 w-full justify-start">
            <TabsTrigger value="lineup">Lineup</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="lineup">
            <LineupTab squadPlayers={squadPlayers} />
          </TabsContent>

          <TabsContent value="scores">
            <ScoresTab squadMeta={squadMeta} />
          </TabsContent>

          <TabsContent value="trades">
            <TradesTab
              squadPlayers={squadPlayers}
              allPlayersMap={playersMap}
              budget={budget}
              onBudgetChange={setBudget}
              onSubmit={submitTrade}
            />
          </TabsContent>
        </Tabs>
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
