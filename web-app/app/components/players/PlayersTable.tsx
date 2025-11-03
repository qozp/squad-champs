import { useEffect, useState } from "react";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/client";
import { Input } from "../ui/input";

const PAGE_SIZE = 10;

export default function PlayersTable() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const supabase = createClient();

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

  // Filter players whenever the search term changes
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPlayers(players);
      setPage(1);
      return;
    }

    const query = search.toLowerCase();
    const filtered = players.filter((p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
    );

    setFilteredPlayers(filtered);
    setPage(1); // reset to first page when searching
  }, [search, players]);

  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
  const paginatedPlayers = filteredPlayers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div>
      {/* Search Input */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Team</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Loading...
              </TableCell>
            </TableRow>
          ) : paginatedPlayers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No players found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedPlayers.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.first_name} {p.last_name}
                </TableCell>
                <TableCell>{p.position}</TableCell>
                <TableCell>{p.team_name ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>

        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </p>

        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
