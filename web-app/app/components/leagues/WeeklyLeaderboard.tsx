// app/components/leagues/WeeklyLeaderboard.tsx
import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import LeaderboardTable from "~/components/leagues/LeaderboardTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyLeaderboardProps {
  currentGameweek: number;
}

interface GameweekInfo {
  gameweek: number;
  start_date: string;
  end_date: string;
}

export default function WeeklyLeaderboard({
  currentGameweek,
}: WeeklyLeaderboardProps) {
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState<number>(0);
  const [gameweekInfo, setGameweekInfo] = useState<GameweekInfo | null>(null);
  const [minGameweek, setMinGameweek] = useState<number>(1);
  const [maxGameweek, setMaxGameweek] = useState<number>(1);

  const fetchWeeklySquads = async (gameweek: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser.rpc(
        "get_weekly_leaderboard",
        {
          gameweek_param: gameweek,
        }
      );
      if (error) throw error;
      setSquads(data);

      // Fetch gameweek info
      const { data: gwData } = await supabaseBrowser
        .from("gameweek")
        .select("gameweek, start_date, end_date")
        .eq("gameweek", gameweek)
        .single();

      setGameweekInfo(gwData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initializeGameweek() {
      try {
        setLoading(true);

        // Get distinct gameweeks that actually exist in squad history
        const { data, error } = await supabaseBrowser
          .from("squad_history")
          .select("gameweek")
          .order("gameweek", { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) {
          return;
        }

        // Deduplicate just in case
        const uniqueGameweeks = Array.from(
          new Set(data.map((d) => d.gameweek))
        );

        const min = uniqueGameweeks[0];
        const max = uniqueGameweeks[uniqueGameweeks.length - 1];

        setMinGameweek(min);
        setMaxGameweek(max);

        // Default to latest recorded gameweek
        const defaultGameweek = max;
        setSelectedGameweek(defaultGameweek);
        fetchWeeklySquads(defaultGameweek);
      } catch (err) {
        console.error(err);
      } finally {
      }
    }

    initializeGameweek();
  }, []);

  const handlePreviousWeek = () => {
    const newGameweek = Math.max(minGameweek, selectedGameweek - 1);
    setSelectedGameweek(newGameweek);
    fetchWeeklySquads(newGameweek);
  };

  const handleNextWeek = () => {
    const newGameweek = Math.min(maxGameweek, selectedGameweek + 1);
    setSelectedGameweek(newGameweek);
    fetchWeeklySquads(newGameweek);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex-1 text-foreground m-4">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Loading weekly leaderboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  return (
    <div className="flex-1 text-foreground m-4">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Weekly Leaderboard</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousWeek}
                  disabled={selectedGameweek <= minGameweek}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  Week {selectedGameweek}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextWeek}
                  disabled={selectedGameweek >= maxGameweek}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-lg mb-4">
              {gameweekInfo
                ? `${formatDate(gameweekInfo.start_date)} - ${formatDate(gameweekInfo.end_date)}`
                : "Select a gameweek to view"}
            </CardDescription>
            <LeaderboardTable
              data={squads}
              gameweek={selectedGameweek}
              isWeekly={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}