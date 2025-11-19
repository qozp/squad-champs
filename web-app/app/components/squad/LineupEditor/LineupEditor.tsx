import { useState } from "react";
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
import type { SquadPlayer } from "~/lib/types/squad";
import { supabaseBrowser } from "~/lib/supabase/client";

interface LineupEditorTableProps {
  initialPlayers: SquadPlayer[];
}

export default function LineupEditorTable({
  initialPlayers,
}: LineupEditorTableProps) {
  // Extract exactly 13 players
  const captain = initialPlayers.find((p) => p.is_captain)!;
  const vice = initialPlayers.find((p) => p.is_vice_captain)!;

  // Should be exactly 8
  const otherStarters = initialPlayers.filter(
    (p) => p.is_starting && !p.is_captain && !p.is_vice_captain
  );

  // Should be exactly 3
  const bench = initialPlayers.filter((p) => !p.is_starting);

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
    setHasChanges(true); // 🔥 mark changes
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

  // -------------------------------
  // Save RPC (placeholder)
  // -------------------------------
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
    setHasChanges(false);
  }

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Edit Lineup</h2>

      {hasChanges && (
        <div className="rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
          Click <strong>Save Lineup</strong> below to save your changes.
        </div>
      )}

      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((player, i) => (
            <TableRow
              key={i}
              className={
                pendingSwitch === i ? "bg-accent/40 font-semibold" : ""
              }
            >
              <TableCell className="font-medium">
                {i === 0
                  ? "Captain"
                  : i === 1
                    ? "Vice-Captain"
                    : i < 10
                      ? `Starter ${i + 1}`
                      : `Bench ${i - 9}`}
              </TableCell>

              <TableCell>
                {player ? `${player.first_name} ${player.last_name}` : "—"}
              </TableCell>

              <TableCell>{player.pos ?? "—"}</TableCell>
              <TableCell>{player.team_abbreviation ?? "—"}</TableCell>
              <TableCell>
                {player ? `$${player.purchase_price}` : "—"}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant={pendingSwitch === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => triggerSwitch(i)}
                >
                  {pendingSwitch === null
                    ? "Switch"
                    : pendingSwitch === i
                      ? "Cancel"
                      : "Confirm Swap"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* SAVE BUTTON */}
      <Button className="w-full mt-4" onClick={saveLineup}>
        Save Lineup
      </Button>
    </div>
  );
}
