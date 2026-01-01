import { useEffect, useState } from "react";
import WeeklyLeaderboard from "~/components/leagues/WeeklyLeaderboard";
import { getEasternSportsDate } from "~/lib/helpers/gameweek";
import { supabaseBrowser } from "~/lib/supabase/client";

export default function WeeklyLeaderboardPage() {
  const [currentGameweek, setCurrentGameweek] = useState<number>(0);

  useEffect(() => {
    async function loadGameweek() {
      const today = getEasternSportsDate();

      const { data } = await supabaseBrowser
        .from("gameweek")
        .select("gameweek")
        .lte("start_date", today)
        .gte("end_date", today)
        .maybeSingle();

      setCurrentGameweek(data?.gameweek ?? 1);
    }

    loadGameweek();
  }, []);

  return <WeeklyLeaderboard currentGameweek={currentGameweek} />;
}
