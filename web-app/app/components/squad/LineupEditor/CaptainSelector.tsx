// components/squad/LineupEditor/CaptainSelector.tsx
import PlayerCard from "~/components/players/PlayerCard";
import type { SquadPlayer } from "~/lib/types/squad";

interface CaptainSelectorProps {
  captain: SquadPlayer | null;
  vice: SquadPlayer | null;
  onSelectCaptain: () => void;
  onSelectVice: () => void;
}

export default function CaptainSelector({
  captain,
  vice,
  onSelectCaptain,
  onSelectVice,
}: CaptainSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Captain & Vice-Captain</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Captain */}
        {captain ? (
          <PlayerCard
            name={`${captain.first_name} ${captain.last_name}`}
            pos={captain.pos}
            captain
            onClick={onSelectCaptain}
          />
        ) : (
          <div
            onClick={onSelectCaptain}
            className="border p-4 rounded-lg bg-muted/40 flex items-center justify-center cursor-pointer text-muted-foreground text-sm"
          >
            Select Captain
          </div>
        )}

        {/* Vice */}
        {vice ? (
          <PlayerCard
            name={`${vice.first_name} ${vice.last_name}`}
            position={vice.pos}
            vice
            onClick={onSelectVice}
          />
        ) : (
          <div
            onClick={onSelectVice}
            className="border p-4 rounded-lg bg-muted/40 flex items-center justify-center cursor-pointer text-muted-foreground text-sm"
          >
            Select Vice-Captain
          </div>
        )}
      </div>
    </div>
  );
}
