import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import LeaderboardTable from "~/components/leagues/LeaderboardTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";

export default function Leaderboard() {
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSquads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser.rpc("get_leaderboard");
      if (error) throw error;
      setSquads(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  if (loading)
    return (
      <p className="flex flex-1 items-center min-h-screen justify-center text-lg text-foreground">
        Loading Leaderboard...
      </p>
    );

  return (
    <div className="flex-1 text-foreground m-4">
      <Card className="">
        <CardContent className="">
          <CardTitle className="">Leaderboard</CardTitle>
          <CardDescription className="text-lg">
            View top squads and their points.
          </CardDescription>
          <LeaderboardTable data={squads} />
        </CardContent>
      </Card>
    </div>
  );
}
