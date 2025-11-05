import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import LeaderboardTable from "~/components/leagues/LeaderboardTable";

export default function LeaguesPage() {
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
    return <p className="p-10 text-center">Loading leaderboard...</p>;

  return (
    <div className="min-h-screen text-foreground p-10">
      <h1 className="text-4xl font-bold mb-6">Leaderboard</h1>
      <p className="text-lg mb-4">View top squads and their points.</p>
      <LeaderboardTable data={squads} />
    </div>
  );
}
