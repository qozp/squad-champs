import { Card, CardContent } from "~/components/ui/card";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";
import { useState, useEffect } from "react";
import { createClient } from "~/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import PlayersTable from "~/components/players/PlayersTable";

export function meta() {
  return [
    { title: "Players - Squad Champs" },
    { name: "description", content: "Browse and view player stats." },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function Players() {
  const supabase = createClient();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayersAndTeams = async () => {
    try {
      // Fetch all players
      const { data: playersData, error: playersError } = await supabase
        .from("player")
        .select("*");
      if (playersError) throw playersError;

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("team")
        .select("*");
      if (teamsError) throw teamsError;

      // Build a mapping from team_id → team_name
      const teamMap: Record<number, string> = {};
      teamsData?.forEach((t: any) => {
        teamMap[t.id] = t.team_name;
      });

      // Map each player to include team_name
      const playersWithTeamName = playersData?.map((p: any) => ({
        ...p,
        team_name: p.team_id ? teamMap[p.team_id] : "N/A",
      }));

      setPlayers(playersWithTeamName || []);
    } catch (err) {
      console.error("Error fetching players or teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersAndTeams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading players...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <section className="container px-10 py-10">
        <h1 className="text-4xl font-bold mb-8">Browse Players</h1>
        <p className="mb-6">
          Explore the top NBA players, their stats, and add them to your fantasy
          squad.
        </p>
        <PlayersTable />
      </section>
    </div>
  );
}
