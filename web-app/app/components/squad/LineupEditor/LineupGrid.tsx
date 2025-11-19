// components/squad/LineupEditor/LineupGrid.tsx
import PlayerCard from "~/components/players/PlayerCard";
import type { SquadPlayer } from "~/lib/types/squad";

interface LineupGridProps {
  starters: SquadPlayer[];
  onSelectSlot: (slotIndex: number) => void;
}

export default function LineupGrid({
  starters,
  onSelectSlot,
}: LineupGridProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Starting Lineup (10)</h3>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => {
          const player = starters[i];

          return player ? (
            <PlayerCard
              key={i}
              name={`${player.first_name} ${player.last_name}`}
              pos={player.pos}
              captain={player.is_captain}
              vice={player.is_vice_captain}
              onClick={() => onSelectSlot(i)}
            />
          ) : (
            <div
              key={i}
              onClick={() => onSelectSlot(i)}
              className="border rounded-lg p-4 bg-muted/40 flex items-center justify-center text-xs text-muted-foreground cursor-pointer"
            >
              Empty
            </div>
          );
        })}
      </div>
    </div>
  );
}
