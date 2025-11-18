import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import type { PlayerBasic, SquadPlayerDisplay } from "~/lib/types/squad";

type SquadPlayersPanelProps = {
  mode: "create" | "update";
  players: SquadPlayerDisplay[];
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
  const grouped: Record<keyof typeof POSITION_SLOTS, SquadPlayerDisplay[]> = {
    Guard: [],
    Forward: [],
    Center: [],
  };

  players.forEach((p) => {
    if (grouped[p.position]) grouped[p.position].push(p);
  });

  // Convert to slot rows
  const renderRows = (position: keyof typeof POSITION_SLOTS) => {
    const slots = POSITION_SLOTS[position];
    const items = grouped[position];

    const rows = [];

    for (let i = 0; i < slots; i++) {
      const p = items[i];

      rows.push(
        <TableRow key={`${position}-${i}`}>
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
          <TableCell>{position}</TableCell>
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
