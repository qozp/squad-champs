import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import type { PlayerBasic, SquadPlayer } from "~/lib/types/squad";

type SquadPlayersPanelProps = {
  mode: "create" | "update";
  players: SquadPlayer[];
  onRemove?: (id: number) => void;
};

const POSITION_SLOTS = {
  Guard: 5,
  Forward: 5,
  Center: 3,
};

export default function SquadPlayersPanel({
  mode,
  players,
  onRemove,
}: SquadPlayersPanelProps) {
  // Build organized lists
  const grouped: Record<keyof typeof POSITION_SLOTS, SquadPlayer[]> = {
    Guard: [],
    Forward: [],
    Center: [],
  };

  players.forEach((p) => {
    if (grouped[p.pos]) grouped[p.pos].push(p);
  });

  // Convert to slot rows
  const renderRows = (pos: keyof typeof POSITION_SLOTS) => {
    const slots = POSITION_SLOTS[pos];
    const items = grouped[pos];

    const rows = [];

    for (let i = 0; i < slots; i++) {
      const p = items[i];

      rows.push(
        <TableRow key={`${pos}-${i}`}>
          <TableCell>{i + 1}</TableCell>
          <TableCell>
            {p ? (
              <>
                {p.first_name} {p.last_name}
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>
          <TableCell>{pos}</TableCell>
          <TableCell>{p ? `$${p.price}` : "—"}</TableCell>

          {mode === "create" && p && onRemove && (
            <TableCell>
              <button
                className="text-red-500 hover:underline cursor-pointer"
                onClick={() => onRemove(p.id)}
              >
                Remove
              </button>
            </TableCell>
          )}
        </TableRow>
      );
    }

    return rows;
  };

  return (
    <div className="">
      {(["Guard", "Forward", "Center"] as const).map((pos) => (
        <div key={pos}>
          <h3 className="font-semibold">{pos}s</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>Price</TableHead>
                {mode === "create" && <TableHead>Remove</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>{renderRows(pos)}</TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
