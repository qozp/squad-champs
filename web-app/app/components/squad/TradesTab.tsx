import { useState, useMemo } from "react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import SquadPlayersPanel from "./CreateSquadPlayersPanel";
import PlayersTableForSquad from "./PlayersTableForSquad";
import type { SquadPlayer, PlayerBasic } from "~/lib/types/squad";
import { toast } from "sonner";

interface TradesTabProps {
  squadPlayers: SquadPlayer[];
  allPlayersMap: Record<number, PlayerBasic>;
  budget: number;
  onSubmit: (rows: (PlayerBasic | null)[]) => Promise<void>;
}

export default function TradesTab({
  squadPlayers,
  allPlayersMap,
  budget,
  onSubmit,
}: TradesTabProps) {
  // ------------------------------
  // Build 13 rows (squad layout)
  // ------------------------------
  const initialRows: (PlayerBasic | null)[] = squadPlayers.map((p) => ({
    id: p.player_id,
    first_name: p.first_name,
    last_name: p.last_name,
    pos: p.pos,
    purchase_price: p.purchase_price,
    price: p.purchase_price,
    team_abbreviation: p.team_abbreviation,
  }));

  // Fill missing positions with null
  while (initialRows.length < 13) initialRows.push(null);

  const [rows, setRows] = useState<(PlayerBasic | null)[]>(initialRows);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const POSITION_MAX = { Guard: 5, Forward: 5, Center: 3 };

  // ------------------------------
  // Remove a player (creates hole)
  // ------------------------------
  function removePlayerAt(index: number) {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  }

  // ------------------------------
  // Validation helpers
  // ------------------------------
  function validatePlayerAdd(player: PlayerBasic): string | null {
    // Duplicate check
    if (rows.some((r) => r?.id === player.id)) {
      return "Player already in squad.";
    }

    // Team limit
    const teamCount = rows.filter(
      (r) => r?.team_abbreviation === player.team_abbreviation
    ).length;

    if (teamCount >= 3) {
      return "Max 3 players from the same team.";
    }

    // Position limit
    const posCount = rows.filter((r) => r?.pos === player.pos).length;

    if (posCount >= POSITION_MAX[player.pos]) {
      return `Cannot add more ${player.pos}s.`;
    }

    // Budget check
    if (budget - player.price < 0) {
      return "Not enough budget.";
    }

    return null;
  }

  // ------------------------------
  // Add player into next empty slot
  // ------------------------------
  function addPlayerToEmptySlot(player: PlayerBasic) {
    const validationError = validatePlayerAdd(player);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setRows((prev) => {
      const updated = [...prev];
      const emptyIndex = updated.findIndex((r) => r === null);

      if (emptyIndex === -1) {
        toast.error("No available slot.");
        return prev;
      }

      updated[emptyIndex] = player;
      setHighlightedIndex(emptyIndex);
      setTimeout(() => setHighlightedIndex(null), 2000);

      return updated;
    });
  }

  // ------------------------------
  // Discard all changes
  // ------------------------------
  function discardChanges() {
    setRows(initialRows);
    setHighlightedIndex(null);
  }

  // ------------------------------
  // Can save?
  // ------------------------------
  const hasChanges = useMemo(() => {
    return JSON.stringify(rows) !== JSON.stringify(initialRows);
  }, [rows, initialRows]);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT PANEL - CURRENT SQUAD */}
      <Card className="flex-1">
        <CardContent>
          <CardTitle>Your Squad</CardTitle>

          <div className="mt-4 space-y-4">
            <SquadPlayersPanel
              mode="trade"
              players={rows}
              onRemove={removePlayerAt}
              highlightedIndex={highlightedIndex}
            />
          </div>
        </CardContent>
      </Card>

      {/* RIGHT PANEL - AVAILABLE PLAYERS */}
      <Card className="flex-1">
        <CardContent>
          <CardTitle>Trade In</CardTitle>

          <PlayersTableForSquad
            mode="trade"
            selected={[]} // no highlighting on right panel
            playersMap={allPlayersMap}
            budget={budget}
            onAddPlayer={(id) => {
              const p = allPlayersMap[id];
              if (p) addPlayerToEmptySlot(p);
            }}
          />

          {/* ACTION BUTTONS */}
          <div className="mt-4 flex gap-3">
            {hasChanges && (
              <Button
                variant="outline"
                className="border-red-400 text-red-600"
                onClick={discardChanges}
              >
                Discard Changes
              </Button>
            )}

            <Button
              className="flex-1"
              disabled={!hasChanges}
              onClick={() => onSubmit(rows)}
            >
              Save Trades
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
