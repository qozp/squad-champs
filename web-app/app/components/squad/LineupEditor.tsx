import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { toast } from "sonner";
import { type SquadPlayer } from "~/lib/types/squad";
import { supabaseBrowser } from "~/lib/supabase/client";
import { ArrowUpDown, Repeat } from "lucide-react";
import { getSalePrice } from "~/lib/helpers/squadPlayer";

interface LineupEditorTableProps {
  initialPlayers: SquadPlayer[];
}

export default function LineupEditorTable({
  initialPlayers,
}: LineupEditorTableProps) {
  // Extract exactly 13 players
  const captain = initialPlayers.find((p) => p.is_captain)!;
  const vice = initialPlayers.find((p) => p.is_vice_captain)!;
  const otherStarters = initialPlayers.filter(
    (p) => p.is_starting && !p.is_captain && !p.is_vice_captain
  );
  const bench = initialPlayers.filter((p) => !p.is_starting);

  const [initialOrder, setInitialOrder] = useState<number[]>([
    captain.player_id,
    vice.player_id,
    ...otherStarters.map((p) => p.player_id),
    ...bench.map((p) => p.player_id),
  ]);

  // Final lineup array
  const [rows, setRows] = useState<SquadPlayer[]>([
    captain, // row 0
    vice, // row 1
    ...otherStarters, // rows 2–9 (Starter 3–10)
    ...bench, // rows 10–12 (Bench 1–3)
  ]);

  // Row the user first clicked “Switch” on
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const changedRowIndexes = useMemo(() => {
    return rows.map((p, i) => p.player_id !== initialOrder[i]);
  }, [rows, initialOrder]);

  const shortPos = (pos: string) => {
    if (!pos) return "";
    const map: Record<string, string> = {
      Guard: "G",
      Forward: "F",
      Center: "C",
    };
    return map[pos] ?? pos.charAt(0);
  };

  const formatName = (first: string, last: string) => {
    const full = `${first} ${last}`;
    if (full.length <= 16) return full;
    return `${first.charAt(0)}. ${last}`;
  };

  function discardChanges() {
    // Convert initialOrder IDs back to full player objects
    const restoredRows = initialOrder.map(
      (id) => initialPlayers.find((p) => p.player_id === id)!
    );

    setRows(restoredRows);
    setPendingSwitch(null);
    setHasChanges(false);
    toast.success("Changes discarded.");
  }

  // -------------------------------
  // Row Switch Logic
  // -------------------------------
  function triggerSwitch(index: number) {
    if (pendingSwitch === null) {
      setPendingSwitch(index);
      return;
    }

    if (pendingSwitch === index) {
      setPendingSwitch(null);
      return;
    }

    // Perform swap
    const a = pendingSwitch;
    const b = index;

    // Perform swap
    const updated = [...rows];
    const temp = updated[a];
    updated[a] = updated[b];
    updated[b] = temp;

    setRows(updated);
    setPendingSwitch(null);
    const changed = updated.some((p, idx) => p.player_id !== initialOrder[idx]);
    setHasChanges(changed);
  }

  // -------------------------------
  // Validation
  // -------------------------------
  function validateLineup() {
    const starters = rows.slice(0, 10).filter(Boolean) as SquadPlayer[];
    const counts = { Guard: 0, Forward: 0, Center: 0 };

    starters.forEach((p) => (counts[p.pos] += 1));

    if (counts.Guard < 1 || counts.Forward < 1 || counts.Center < 1) {
      toast.error(
        "Your starting lineup must include at least 1 of each position."
      );
      return false;
    }
    return true;
  }

  async function saveLineup() {
    if (!validateLineup()) return;

    const payload = {
      captain_id: rows[0]?.player_id || null,
      vice_id: rows[1]?.player_id || null,
      starters: rows.slice(0, 10).map((p) => p?.player_id || null),
      bench: rows.slice(10, 13).map((p) => p?.player_id || null),
    };

    const { error } = await supabaseBrowser.rpc("update_squad_lineup", payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Lineup saved!");
    setInitialOrder(rows.map((p) => p.player_id));
    setHasChanges(false);
  }

  function renderPlayerRow(player: SquadPlayer, index: number) {
    const isChanged = changedRowIndexes[index];
    const isPending = pendingSwitch === index;

    return (
      <TableRow
        key={index}
        className={[
          isPending ? "bg-accent/40" : "",
          isChanged ? "bg-blue-100 dark:bg-blue-900/30" : "",
          "transition-colors",
        ].join(" ")}
      >
        <TableCell className="space-x-1">
          {/* Swap button */}
          <Button
            variant={isPending ? "secondary" : "outline"}
            size="icon"
            onClick={() => triggerSwitch(index)}
          >
            <ArrowUpDown size={16} />
          </Button>

          {/* Trade button */}
          {/* <Button variant="outline" size="icon" onClick={() => onTrade(player)}>
            <Repeat size={16} />
          </Button> */}
        </TableCell>

        <TableCell>{formatName(player.first_name, player.last_name)}</TableCell>
        <TableCell>{shortPos(player.pos)}</TableCell>
        <TableCell>{player.team_abbreviation}</TableCell>
        <TableCell>${getSalePrice(player)}</TableCell>
      </TableRow>
    );
  }

  function renderSection(label: string, start: number, end: number) {
    return (
      <>
        <TableRow className="bg-muted/60">
          <TableCell colSpan={6} className="font-semibold text-sm">
            {label}
          </TableCell>
        </TableRow>

        {rows.slice(start, end).map((player, i) => {
          const actualIndex = start + i;
          return renderPlayerRow(player, actualIndex);
        })}
      </>
    );
  }

  const LINEUP_SECTIONS = [
    {
      label: "Captain & Vice-Captain",
      start: 0,
      end: 2, // slice(0, 2)
    },
    {
      label: "Other Starters",
      start: 2,
      end: 10, // slice(2, 10)
    },
    {
      label: "Bench",
      start: 10,
      end: 13, // slice(10, 13)
    },
  ] as const;

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="space-y-2">
      {hasChanges && (
        <div className="rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
          Click <strong>Save Lineup</strong> below to save your changes.
        </div>
      )}

      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {LINEUP_SECTIONS.map((section) =>
            renderSection(section.label, section.start, section.end)
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          variant="outline"
          onClick={discardChanges}
          className="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          disabled={!hasChanges}
        >
          Discard Changes
        </Button>

        <Button variant="outline" onClick={saveLineup} disabled={!hasChanges}>
          Save Lineup
        </Button>
      </div>
    </div>
  );
}
