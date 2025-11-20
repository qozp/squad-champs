import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import CreateSquadPlayersPanel from "./CreateSquadPlayersPanel";
import PlayersTableForSquad from "./PlayersTableForSquad";
import { type SquadPlayer, type PlayerBasic } from "~/lib/types/squad";
import { getSalePrice } from "~/lib/helpers/squadPlayer";
import { toast } from "sonner";

interface TradePayload {
  rowsOut: SquadPlayer[];
  rowsIn: PlayerBasic[];
}

interface TradesTabProps {
  squadPlayers: SquadPlayer[];
  allPlayersMap: Record<number, PlayerBasic>;
  budget: number;
  onBudgetChange: (newBudget: number) => void;
  onSubmit: (payload: TradePayload) => Promise<void>;
}

type SquadPlayerSlot = PlayerBasic | null;

export default function TradesTab({
  squadPlayers,
  allPlayersMap,
  budget,
  onBudgetChange,
  onSubmit,
}: TradesTabProps) {
  const [displayedPlayers, setDisplayedPlayers] =
    useState<SquadPlayerSlot[]>(squadPlayers);
  const [budgetDiff, setBudgetDiff] = useState<number>(0);

  function removePlayer(playerId: number) {
    const sp = displayedPlayers.find((p) => p?.player_id === playerId);
    if (!sp) return;

    const sellPrice = getSalePrice(sp);

    onBudgetChange(budget + sellPrice);
    setBudgetDiff((prev) => prev + sellPrice);

    setDisplayedPlayers((prev) =>
      prev.map((slot) => (slot?.player_id === playerId ? null : slot))
    );
  }

  function addPlayer(id: number): void {
    const p = allPlayersMap[id];
    if (!p) return;

    // Find the positional slot
    const slotIndex = findEmptySlotForPlayer(p, displayedPlayers);
    if (slotIndex === null) {
      toast.error(`No available ${p.pos} slot. Remove a ${p.pos} first.`);
      return;
    }

    let newBudget = budget;

    // Deduct cost
    newBudget -= p.current_price;
    setBudgetDiff((prev) => prev - p.current_price);

    // Update budget upstream
    onBudgetChange(newBudget);

    // Insert new player
    setDisplayedPlayers((prev) => {
      const clone = [...prev];
      clone[slotIndex] = p;
      return clone;
    });

    toast.success(`${p.first_name} ${p.last_name} added to your squad.`);
  }

  function findEmptySlotForPlayer(
    player: PlayerBasic,
    players: SquadPlayerSlot[]
  ): number | null {
    // Layout: 5 Guards, 5 Forwards, 3 Centers
    const POSITIONS = {
      Guard: { start: 0, count: 5 },
      Forward: { start: 5, count: 5 },
      Center: { start: 10, count: 3 },
    } as const;

    const { start, count } = POSITIONS[player.pos];

    for (let i = start; i < start + count; i++) {
      if (players[i] === null) return i; // found empty slot
    }

    return null; // no slots available
  }

  function discardChanges(): void {
    setDisplayedPlayers(squadPlayers);
    onBudgetChange(budget - budgetDiff);
    setBudgetDiff(0);
    toast.success("Changes discarded.");
  }

  function sendSubmit(): void {
    const payload = { rowsOut, rowsIn };
    onSubmit(payload);
  }

  const selectedIds = useMemo(() => {
    return displayedPlayers
      .filter((p): p is PlayerBasic => p !== null)
      .map((p) => p.player_id);
  }, [displayedPlayers]);

  // Players removed or replaced
  const rowsOut = useMemo(() => {
    return squadPlayers
      .map((orig, idx) => {
        const cur = displayedPlayers[idx];

        if (orig && !cur) return orig; // removed
        if (orig && cur && orig.player_id !== cur.player_id) return orig; // replaced

        return null;
      })
      .filter((p): p is SquadPlayer => p !== null);
  }, [displayedPlayers, squadPlayers]);

  // Players added or replacements
  const rowsIn = useMemo(() => {
    return displayedPlayers
      .map((cur, idx) => {
        const orig = squadPlayers[idx];

        if (!orig && cur) return cur; // newly added
        if (orig && cur && orig.player_id !== cur.player_id) return cur; // replacement

        return null;
      })
      .filter((p): p is PlayerBasic => p !== null);
  }, [displayedPlayers, squadPlayers]);

  const hasChanges = useMemo(() => {
    if (displayedPlayers.length !== squadPlayers.length) return true;

    for (let i = 0; i < displayedPlayers.length; i++) {
      const a = displayedPlayers[i];
      const b = squadPlayers[i];

      // One is null, the other isn't
      if ((a === null) !== (b === null)) return true;

      // Both non-null, check if different players
      if (a && b && a.player_id !== b.player_id) return true;
    }

    return false;
  }, [displayedPlayers, squadPlayers]);

  const canSubmit = useMemo(() => {
    // 1. Budget must be >= 0
    if (budget < 0) return false;

    // 2. Must have exactly 13 filled slots
    const filledCount = displayedPlayers.filter((p) => p !== null).length;
    if (filledCount !== 13) return false;

    // 3. All positional slots must be filled
    const counts = { Guard: 0, Forward: 0, Center: 0 };

    displayedPlayers.forEach((p) => {
      if (p) counts[p.pos]++;
    });

    if (counts.Guard !== 5) return false;
    if (counts.Forward !== 5) return false;
    if (counts.Center !== 3) return false;

    return true;
  }, [budget, displayedPlayers]);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT PANEL - CURRENT SQUAD */}
      <Card className="flex-1">
        <CardContent>
          <CardTitle>Your Squad</CardTitle>
          <CreateSquadPlayersPanel
            players={displayedPlayers}
            onRemove={removePlayer}
          ></CreateSquadPlayersPanel>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={discardChanges}
              className="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              disabled={!hasChanges}
            >
              Discard Changes
            </Button>

            <Button
              variant="outline"
              onClick={sendSubmit}
              disabled={!hasChanges || !canSubmit}
            >
              Submit Trades
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT PANEL - AVAILABLE PLAYERS */}
      <Card className="flex-1">
        <CardContent>
          <CardTitle>Trade In</CardTitle>
          <PlayersTableForSquad
            selected={selectedIds}
            playersMap={allPlayersMap}
            budget={budget}
            onAddPlayer={addPlayer}
          ></PlayersTableForSquad>
        </CardContent>
      </Card>
    </div>
  );
}

