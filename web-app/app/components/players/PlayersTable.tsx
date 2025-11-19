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
import { supabaseBrowser } from "~/lib/supabase/client";
import { Input } from "../ui/input";
import PositionFilter from "./PositionSelect";

const PAGE_SIZE = 10;

export default function PlayersTable({}) {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof any | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | "">(
    "asc"
  );
  const [positionFilter, setPositionFilter] = useState("All Positions");

  const fetchPlayersAndTeams = async () => {
    try {
      // Fetch all players
      const { data: playersData, error: playersError } = await supabaseBrowser
        .from("player")
        .select("*");
      if (playersError) throw playersError;

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabaseBrowser
        .from("team")
        .select("*");
      if (teamsError) throw teamsError;

      // Build a mapping from team_id → team_abbreviation
      const teamMap: Record<number, string> = {};
      teamsData?.forEach((t: any) => {
        teamMap[t.id] = t.team_abbreviation;
      });

      const { data: statsData, error } = await supabaseBrowser.rpc(
        "get_player_averages"
      );

      // Map stats by player_id for easy access
      const statsMap: Record<number, any> = {};
      statsData?.forEach((s: any) => {
        statsMap[s.player_id] = s;
      });

      // Merge players, teams, and stats
      let playersWithStats = playersData?.map((p: any) => ({
        ...p,
        team_abbreviation: p.team_id ? teamMap[p.team_id] : "N/A",
        avg_pts: statsMap[p.id]?.avg_pts ?? 0,
        avg_reb: statsMap[p.id]?.avg_reb ?? 0,
        avg_ast: statsMap[p.id]?.avg_ast ?? 0,
        avg_stl: statsMap[p.id]?.avg_stl ?? 0,
        avg_blk: statsMap[p.id]?.avg_blk ?? 0,
        avg_fp: statsMap[p.id]?.avg_fp ?? 0,
        price: p.price ? p.price : "N/A",
      }));

      // Sort by avg_fp descending (highest first)
      playersWithStats = playersWithStats?.sort((a, b) => b.avg_fp - a.avg_fp);

      setPlayers(playersWithStats || []);
    } catch (err) {
      console.error("Error fetching players or teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "first_name", label: "Player" },
    { key: "pos", label: "Position" },
    { key: "team_abbreviation", label: "Team" },
    { key: "avg_pts", label: "PPG" },
    { key: "avg_reb", label: "RPG" },
    { key: "avg_ast", label: "APG" },
    { key: "avg_stl", label: "SPG" },
    { key: "avg_blk", label: "BPG" },
    { key: "avg_fp", label: "FPPG" },
    { key: "price", label: "Price ($)" },
  ];

  useEffect(() => {
    fetchPlayersAndTeams();
  }, []);

  // Filter players whenever the search term changes
  useEffect(() => {
    let filtered = players;

    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
      );
    }

    if (positionFilter != "All Positions") {
      filtered = filtered.filter((p) => p.pos === positionFilter);
    }

    setFilteredPlayers(filtered);
    setPage(1);
  }, [search, positionFilter, players]);

  // Function to handle clicking a column header
  const handleSort = (column: keyof any) => {
    if (sortBy === column) {
      // Cycle through desc → asc → none
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortBy(""); // Clear sort
        setSortDirection(""); // No direction
      } else {
        setSortDirection("desc");
      }
    } else {
      // New column clicked → start with descending
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // Apply sorting
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!sortBy) return 0;
    const valA = a[sortBy] ?? "";
    const valB = b[sortBy] ?? "";

    if (typeof valA === "number" && typeof valB === "number") {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }

    return sortDirection === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
  const paginatedPlayers = sortedPlayers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    // wait for profile to load
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-lg text-foreground">Loading players...</p>
      </div>
    );
  }

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
        <PositionFilter value={positionFilter} onChange={setPositionFilter} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="cursor-pointer select-none"
              >
                {col.label}{" "}
                {sortBy === col.key
                  ? sortDirection === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPlayers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No players found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedPlayers.map((p) => (
              <TableRow key={p.id}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.key === "first_name" ? (
                      <a
                        href={`https://www.nba.com/player/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {p.first_name} {p.last_name}
                      </a>
                    ) : typeof p[col.key] === "number" ? (
                      p[col.key].toFixed(1)
                    ) : (
                      (p[col.key] ?? "—")
                    )}
                  </TableCell>
                ))}
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
          disabled={page === 1}
        >
          Previous
        </Button>

        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </p>

        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
