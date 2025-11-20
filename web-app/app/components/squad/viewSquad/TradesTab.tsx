import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { supabaseBrowser } from "~/lib/supabase/client";
import { toast } from "sonner";
import PlayersTableForSquad from "../PlayersTableForSquad";
import SquadPlayersPanel from "../CreateSquadPlayersPanel";

export default function TradesTab({ squadPlayers }: { squadPlayers: any[] }) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Card className="flex-1">
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
