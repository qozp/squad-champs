import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Scroll,
  ScrollText,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { supabaseBrowser } from "~/lib/supabase/client";
import type { SquadHistoryWeek, SquadHistoryPlayer } from "~/lib/types/squad";
import { shortPos, formatName } from "~/lib/helpers/player";

interface Props {
  squadMeta: any;
  currentGameweek: number | null;
}

export default function ScoresTab({ squadMeta, currentGameweek }: Props) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(
    currentGameweek
  );
  const [historyWeeks, setHistoryWeeks] = useState<number[]>([]);
  const [weekData, setWeekData] = useState<SquadHistoryWeek | null>(null);
  const [weekPlayers, setWeekPlayers] = useState<SquadHistoryPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available history weeks
  useEffect(() => {
    async function fetchHistoryWeeks() {
      const { data } = await supabaseBrowser.rpc(
        "get_user_gameweeks_with_history"
      );
      if (data) {
        setHistoryWeeks(data.map((d: any) => d.gameweek));
      }
    }
    fetchHistoryWeeks();
  }, []);

  // Set initial selected week when currentGameweek is available
  useEffect(() => {
    if (currentGameweek && selectedWeek === null) {
      setSelectedWeek(currentGameweek);
    }
  }, [currentGameweek]);

  // Fetch week data when selected week changes
  useEffect(() => {
    if (selectedWeek === null) return;

    async function fetchWeekData() {
      setLoading(true);
      try {
        await fetchWeekDataForGameweek(selectedWeek!);
      } finally {
        setLoading(false);
      }
    }

    fetchWeekData();
  }, [selectedWeek]);

  async function fetchWeekDataForGameweek(gameweek: number) {
    const isCurrentWeek = gameweek === currentGameweek;

    // Always fetch players from squad_history_player (snapshot)
    const playersResponse = await supabaseBrowser.rpc(
      "get_squad_history_players",
      { p_gameweek: gameweek }
    );

    if (playersResponse.data) {
      const normalizedPlayers = playersResponse.data.map((p: any) => {
        const baseScore = p.total_score || 0;
        const multiplier = p.is_captain ? 2 : 1;

        return {
          ...p,
          effective_score: baseScore * multiplier,
        };
      });
      setWeekPlayers(normalizedPlayers);
    }

    // Try to fetch squad_history (may not exist for current week)
    const historyResponse = await supabaseBrowser.rpc("get_squad_history", {
      p_gameweek: gameweek,
    });

    if (historyResponse.data?.[0]) {
      // Historical data exists - use it
      setWeekData(historyResponse.data[0]);
    } else if (isCurrentWeek && playersResponse.data) {
      // Current week with no history yet - calculate from live player scores
      const totalPoints = playersResponse.data.reduce((sum: number, p: any) => {
        if (!p.is_starting) return sum;
        const score = p.total_score || 0;
        const multiplier = p.is_captain ? 2 : 1;
        return sum + score * multiplier;
      }, 0);

      setWeekData({
        gameweek: gameweek,
        gameweek_points: totalPoints,
        rank: 0, // Not calculated yet for current week
        trades_made: squadMeta?.trades_made || 0,
        trade_penalty: squadMeta?.penalty_trades_made * 4 || 0,
      });
    } else {
      // No data found at all
      setWeekData(null);
      setWeekPlayers([]);
    }
  }

  function handlePrevWeek() {
    if (selectedWeek === null) return;
    const newWeek = selectedWeek - 1;
    if (newWeek >= 1) {
      setSelectedWeek(newWeek);
    }
  }

  function handleNextWeek() {
    if (selectedWeek === null || currentGameweek === null) return;
    const newWeek = selectedWeek + 1;
    if (newWeek <= currentGameweek) {
      setSelectedWeek(newWeek);
    }
  }

  const sortedHistoryWeeks = useMemo(() => {
    return [...historyWeeks].sort((a, b) => a - b);
  }, [historyWeeks]);

  const currentIndex = useMemo(() => {
    if (selectedWeek == null) return -1;
    return sortedHistoryWeeks.indexOf(selectedWeek);
  }, [sortedHistoryWeeks, selectedWeek]);

  const isCurrentWeek = selectedWeek === currentGameweek;
  const canGoPrev = currentIndex > 0;
  const canGoNext =
    currentIndex !== -1 && currentIndex < sortedHistoryWeeks.length - 1;

  const starting = weekPlayers.filter((p) => p.is_starting);
  const bench = weekPlayers.filter((p) => !p.is_starting);

  const hasNoData =
    !weekData &&
    weekPlayers.length === 0 &&
    selectedWeek !== null &&
    selectedWeek >= (currentGameweek ?? 0);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="px-4 py-8">
          <p className="text-center text-muted-foreground">
            Loading week data...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 space-y-4">
        {/* Week Navigation */}
        <div className="flex justify-between items-center">
          <CardTitle>Weekly Scores</CardTitle>

          <div className="flex items-center gap-x-3">
            <Button
              variant="default"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevWeek}
              disabled={!canGoPrev}
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="font-medium text-lg min-w-[120px] text-center">
              Week {selectedWeek}
            </span>

            <Button
              variant="default"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextWeek}
              disabled={!canGoNext}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Week Metadata */}
        {weekData && (
          <div className="flex items-center divide-x divide-border bg-muted/20 rounded-lg p-3 text-sm">
            <div className="px-4">
              <p className="font-medium">Gameweek Points</p>
              <p className="text-lg">{weekData.gameweek_points.toFixed(1)}</p>
            </div>

            {!isCurrentWeek && (
              <div className="px-4">
                <p className="font-medium">Rank</p>
                <p className="text-lg">
                  {weekData.rank > 0 ? weekData.rank : "—"}
                </p>
              </div>
            )}

            <div className="px-4">
              <p className="font-medium">Trades Made</p>
              <p className="text-lg">{weekData.trades_made}</p>
            </div>

            <div className="px-4">
              <p className="font-medium">Trade Penalty</p>
              <p className="text-lg">{weekData.trade_penalty}</p>
            </div>
          </div>
        )}

        {/* Players Table or Empty State */}
        {hasNoData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ScrollText className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              Your squad hasn't been recorded yet
            </p>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Your squad's scores will begin appearing here once the next
              gameweek starts (typically on Monday). In the meantime, make sure
              to set your line-up.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Starting Lineup */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="font-semibold text-sm">
                  Starting Lineup
                </TableCell>
              </TableRow>
              {starting.map((player) => (
                <TableRow key={player.player_id}>
                  <TableCell>
                    <div className="flex gap-1">
                      {player.is_captain && "C"}
                      {player.is_vice_captain && "VC"}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatName(player.first_name, player.last_name)}
                  </TableCell>
                  <TableCell>{shortPos(player.pos)}</TableCell>
                  <TableCell>{player.team_abbreviation}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {/* {player.is_captain && (
                      <span className="ml-1 text-xs text-yellow-600">
                        (×2){" "}
                      </span>
                    )} */}
                    {player.effective_score?.toFixed(1) || "0.0"}
                  </TableCell>
                </TableRow>
              ))}

              {/* Bench */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="font-semibold text-sm">
                  Bench
                </TableCell>
              </TableRow>
              {bench.map((player) => (
                <TableRow
                  key={player.player_id}
                  className="text-muted-foreground"
                >
                  <TableCell></TableCell>
                  <TableCell className="font-medium">
                    {formatName(player.first_name, player.last_name)}
                  </TableCell>
                  <TableCell>{shortPos(player.pos)}</TableCell>
                  <TableCell>{player.team_abbreviation}</TableCell>
                  <TableCell className="text-right">
                    {player.effective_score?.toFixed(1) || "0.0"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
