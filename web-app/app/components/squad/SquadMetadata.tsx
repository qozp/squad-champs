import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { sanitizeInput } from "~/lib/moderation";

interface Props {
  squadMeta: any;
  budget: number;
  currentGameweek: number | null;
  onEditName: () => void;
}

export default function SquadMetadata({
  squadMeta,
  budget,
  currentGameweek,
  onEditName,
}: Props) {
  if (!squadMeta) return null;

  const freeTrades = squadMeta.free_trades ?? 0;
  const graceWeek = squadMeta.free_trades_gameweek ?? null;
  const totalPoints = squadMeta.total_points ?? 0;

  const freeTradesLabel =
    graceWeek !== null
      ? `${freeTrades} (GW${graceWeek} Free)`
      : `${freeTrades}`;

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {/* TOP BAR: Overview — Gameweek — Name/Edit */}
        <div className="flex justify-between items-center">
          {/* Left: Overview title */}
          <CardTitle className="w-1/3 justify-start">Squad</CardTitle>

          {/* Middle: Gameweek with arrows */}
          <div className="w-1/3 flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground opacity-50 cursor-not-allowed"
              disabled
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="font-medium text-lg">
              {currentGameweek ? `Week ${currentGameweek}` : "GW —"}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground opacity-50 cursor-not-allowed"
              disabled
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Right: Squad name + edit */}
          <div className="flex justify-end items-center space-x-2 w-1/3">
            <p className="text-lg">
              <strong>Name:</strong> {sanitizeInput(squadMeta.name)}
            </p>

            <Button
              variant="ghost"
              onClick={onEditName}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <Pencil size={16} />
            </Button>
          </div>
        </div>

        {/* METADATA STRIP */}
        <div className="flex items-center divide-x divide-border bg-muted/20 rounded-lg p-3 text-sm">
          <div className="px-4">
            <p className="font-medium">Total Points</p>
            <p>{totalPoints}</p>
          </div>

          <div className="px-4">
            <p className="font-medium">Budget</p>
            <p>${budget}</p>
          </div>

          <div className="px-4">
            <p className="font-medium">Free Trades</p>
            <p>{freeTradesLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
