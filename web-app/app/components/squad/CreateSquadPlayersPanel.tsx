import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { formatName, shortPos } from "~/lib/helpers/player";
import type { PlayerBasic } from "~/lib/types/squad";

const POSITION_SLOTS = {
  Guard: 5,
  Forward: 5,
  Center: 3,
};

export interface CreateSquadPlayersPanelProps {
  players: (PlayerBasic | null)[];
  onRemove: (id: number) => void;
}

export default function CreateSquadPlayersPanel({
  players,
  onRemove,
}: CreateSquadPlayersPanelProps) {
  //
  // 1. Build fixed slot arrays for each position
  //
  const groupedSlots: Record<
    keyof typeof POSITION_SLOTS,
    (PlayerBasic | null)[]
  > = {
    Guard: Array(POSITION_SLOTS.Guard).fill(null),
    Forward: Array(POSITION_SLOTS.Forward).fill(null),
    Center: Array(POSITION_SLOTS.Center).fill(null),
  };

  // Assign players to first available slot in their position group
  players.forEach((p) => {
    if (!p) return;
    const pos = p.pos as keyof typeof POSITION_SLOTS;

    const slotIndex = groupedSlots[pos].findIndex((slot) => slot === null);

    if (slotIndex !== -1) {
      groupedSlots[pos][slotIndex] = p;
    }
  });

  //
  // 2. Render the fixed rows per position
  //
  const renderRows = (pos: keyof typeof POSITION_SLOTS) => {
    return groupedSlots[pos].map((p, i) => (
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

        <TableCell>{p ? `$${p.current_price}` : "—"}</TableCell>

        <TableCell>
          {p && (
            <button
              className="text-red-500 hover:underline cursor-pointer"
              onClick={() => onRemove(p.player_id)}
            >
              Remove
            </button>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div>
      {(["Guard", "Forward", "Center"] as const).map((pos) => (
        <div key={pos}>
          <h3 className="font-semibold">{pos}s</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>{renderRows(pos)}</TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
