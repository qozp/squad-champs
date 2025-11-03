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
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
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
        {players.length === 0 ? (
          <Card className="max-w-lg mx-auto bg-card border border-border">
            <CardContent className="p-6 text-center">
              <p>No players found.</p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Birthdate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    {player.first_name} {player.last_name}
                  </TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.team_name || "N/A"}</TableCell>
                  <TableCell>
                    {player.height_in ? `${player.height_in}"` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {player.weight_lb ? `${player.weight_lb} lb` : "N/A"}
                  </TableCell>
                  <TableCell>{player.birthdate || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
