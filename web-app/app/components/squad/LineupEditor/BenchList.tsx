// components/squad/LineupEditor/BenchList.tsx
import PlayerCard from "~/components/players/PlayerCard";
import type { SquadPlayer } from "~/lib/types/squad";

interface BenchListProps {
  bench: SquadPlayer[];
  onSelectBenchSlot: (index: number) => void;
}

export default function BenchList({
  bench,
  onSelectBenchSlot,
}: BenchListProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Bench (3)</h3>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => {
          const player = bench[i];

          return player ? (
            <PlayerCard
              key={i}
              name={`${player.first_name} ${player.last_name}`}
              position={player.pos}
              onClick={() => onSelectBenchSlot(i)}
            />
          ) : (
            <div
              key={i}
              onClick={() => onSelectBenchSlot(i)}
              className="border rounded-lg p-4 bg-muted/40 flex items-center justify-center cursor-pointer text-xs text-muted-foreground"
            >
              Empty
            </div>
          );
        })}
      </div>
    </div>
  );
}
