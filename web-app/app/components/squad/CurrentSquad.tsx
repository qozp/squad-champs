import { useEffect, useState } from "react";
import { supabaseBrowser } from "~/lib/supabase/client";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";

export default function CurrentSquad() {
  const [squad, setSquad] = useState<any | null>(null); // squad metadata
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        // Fetch squad metadata for current user
        const { data: squadData, error: squadError } = await supabaseBrowser
          .from("squad")
          .select("*");
        if (squadError) throw squadError;
        setSquad(squadData);

        // Fetch squad players using the RPC
        const { data: playerData, error: playerError } =
          await supabaseBrowser.rpc("get_squad_players_by_user");

        if (playerError) throw playerError;
        setPlayers(playerData || []);
      } catch (err) {
        console.error("Error fetching squad:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSquad();
  }, []);

  if (loading) return <p>Loading your squad...</p>;

  return (
    <div>
      {squad && (
        <p className="mb-4 font-semibold">
          {squad.squad_name} Total Points: {squad.total_points}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No players in your squad yet.
              </TableCell>
            </TableRow>
          ) : (
            players.map((p) => (
              <TableRow key={p.player_id}>
                <TableCell>
                  <a
                    href={`https://www.nba.com/player/${p.player_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {p.first_name} {p.last_name}
                  </a>
                </TableCell>
                <TableCell>{p.pos}</TableCell>
                <TableCell>{p.team_name ?? "—"}</TableCell>
                <TableCell>
                  <button className="text-red-500 hover:underline">
                    Remove
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
