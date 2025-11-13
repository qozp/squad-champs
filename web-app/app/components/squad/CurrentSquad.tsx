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
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquad = async () => {
      try {
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

  if (loading)
    return (
      <p className="flex flex-1 items-center justify-center text-lg text-foreground">
        Loading squad...
      </p>
    );

  return (
    <div>
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
