import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import LeaderboardTable from "~/components/leagues/LeaderboardTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { getEasternSportsDate } from "~/lib/helpers/gameweek";

export default function GlobalLeaderboard() {
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGameweek, setCurrentGameweek] = useState<number>(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [{ data: squads }, { data: gw }] = await Promise.all([
          supabaseBrowser.rpc("get_leaderboard"),
          supabaseBrowser
            .from("gameweek")
            .select("gameweek")
            .lte("start_date", getEasternSportsDate())
            .gte("end_date", getEasternSportsDate())
            .maybeSingle(),
        ]);

        setSquads(squads || []);
        setCurrentGameweek(gw?.gameweek ?? 1);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <p className="flex items-center min-h-screen justify-center text-lg">
        Loading Global Leaderboard...
      </p>
    );
  }

  return (
    <div className="flex-1 text-foreground m-4">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <CardTitle>Global Leaderboard</CardTitle>
            <CardDescription className="text-lg mb-4">
              View top squads and their total points.
            </CardDescription>

            <LeaderboardTable data={squads} gameweek={currentGameweek} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
