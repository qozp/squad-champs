import { Button } from "~/components/ui/button";
import SquadPlayersPanel from "./CreateSquadPlayersPanel";
import PlayersTableForSquad from "./PlayersTableForSquad";
import type { PlayerBasic } from "~/lib/types/squad";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

interface Props {
  selectedPlayers: number[];
  playersMap: Record<number, PlayerBasic>;
  budget: number;
  onAddPlayer: (id: number) => void;
  onRemovePlayer: (id: number) => void;
  onRemoveAll: () => void;
  onSubmit: () => Promise<void>;
}

export default function CreateSquad({
  selectedPlayers,
  playersMap,
  budget,
  onAddPlayer,
  onRemovePlayer,
  onRemoveAll,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* LEFT CARD: Selected Players */}
      <Card className="flex-1">
        <CardContent>
          <CardTitle>Your Selected Players</CardTitle>

          <SquadPlayersPanel
            players={selectedPlayers.map((id) => playersMap[id])}
            onRemove={onRemovePlayer}
          />

          <div className="mt-4 flex space-x-3">
            <Button
              variant="outline"
              onClick={onRemoveAll}
              disabled={selectedPlayers.length === 0}
            >
              Remove All
            </Button>

            <Button onClick={onSubmit} disabled={selectedPlayers.length !== 13}>
              Create Squad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT CARD: Player List */}
      <Card className="flex-1">
        <CardContent>
          <CardTitle>Add Players</CardTitle>
          <PlayersTableForSquad
            mode="create"
            selected={selectedPlayers}
            playersMap={playersMap}
            budget={budget}
            onAddPlayer={onAddPlayer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
