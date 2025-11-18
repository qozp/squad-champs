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
import PositionFilter from "../players/PositionSelect";
import type { PlayerBasic } from "~/lib/types/squad";
import PriceSelect from "../players/PriceSelect";

const PAGE_SIZE = 10;
const POSITION_LIMITS = { Guard: 5, Forward: 5, Center: 3 };

type PlayersTableForSquadProps = {
  mode?: "create" | "view";
  selected?: number[];
  playersMap?: Record<number, PlayerBasic>;
  budget?: number;
  onAddPlayer?: (id: number) => void;
};

export default function PlayersTableForSquad({
  mode = "view",
  selected = [],
  playersMap,
  budget,
  onAddPlayer,
}: PlayersTableForSquadProps) {
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
  const [maxPrice, setMaxPrice] = useState<string>("Any");

  const fetchPlayersAndTeams = async () => {
    try {
      const { data: playersData, error: playersError } = await supabaseBrowser
        .from("player")
        .select("*");
      if (playersError) throw playersError;

      const { data: teamsData, error: teamsError } = await supabaseBrowser
        .from("team")
        .select("*");
      if (teamsError) throw teamsError;

      const teamMap: Record<number, string> = {};
      teamsData?.forEach((t: any) => {
        teamMap[t.id] = t.team_abbreviation;
      });

      const { data: statsData } = await supabaseBrowser.rpc(
        "get_player_averages"
      );

      const statsMap: Record<number, any> = {};
      statsData?.forEach((s: any) => {
        statsMap[s.player_id] = s;
      });

      let playersWithStats = playersData?.map((p: any) => ({
        ...p,
        team_name: p.team_id ? teamMap[p.team_id] : "N/A",
        avg_pts: statsMap[p.id]?.avg_pts ?? 0,
        avg_reb: statsMap[p.id]?.avg_reb ?? 0,
        avg_ast: statsMap[p.id]?.avg_ast ?? 0,
        avg_stl: statsMap[p.id]?.avg_stl ?? 0,
        avg_blk: statsMap[p.id]?.avg_blk ?? 0,
        avg_fp: statsMap[p.id]?.avg_fp ?? 0,
        price: p.price ?? "N/A",
      }));

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
    { key: "position", label: "Pos" },
    { key: "avg_fp", label: "FPPG" },
    { key: "price", label: "Price ($)" },
    { key: "team_name", label: "Team" },
  ];

  const shortPos = (pos: string) => {
    if (!pos) return "";
    const map: Record<string, string> = {
      Guard: "G",
      Forward: "F",
      Center: "C",
    };
    return map[pos] ?? pos.charAt(0);
  };

  const formatName = (first: string, last: string) => {
    const full = `${first} ${last}`;
    if (full.length <= 16) return full;
    return `${first.charAt(0)}. ${last}`;
  };

  useEffect(() => {
    fetchPlayersAndTeams();
  }, []);

  useEffect(() => {
    let filtered = players;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)
      );
    }

    if (positionFilter !== "All Positions") {
      filtered = filtered.filter((p) => p.position === positionFilter);
    }

    if (maxPrice !== "Any") {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    setFilteredPlayers(filtered);
  }, [players, search, positionFilter, maxPrice, budget]);

  useEffect(() => {
    setPage(1);
  }, [search, positionFilter, maxPrice]);

  const handleSort = (column: keyof any) => {
    if (sortBy === column) {
      if (sortDirection === "desc") setSortDirection("asc");
      else if (sortDirection === "asc") {
        setSortBy(null);
        setSortDirection("");
      } else {
        setSortDirection("desc");
      }
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

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

  const getPositionCounts = () => {
    const counts: Record<PlayerBasic["position"], number> = {
      Guard: 0,
      Forward: 0,
      Center: 0,
    };

    selected.forEach((id) => {
      const p = playersMap?.[id];
      if (p) counts[p.position] += 1;
    });

    return counts;
  };

  const isAddDisabled = (p: any) => {
    if (mode !== "create") return true; // disable add entirely in view mode

    const position = p.position as "Guard" | "Forward" | "Center";

    // Already added
    if (selected.includes(p.id)) return true;

    // Squad full
    if (selected.length >= 13) return true;

    // Budget check
    if (budget !== undefined && p.price > budget) return true;

    // Position limits
    const counts = getPositionCounts();
    if (counts[position] >= POSITION_LIMITS[position]) return true;

    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-lg text-foreground">Loading players...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Controls */}
      <div className="flex justify-between items-center space-x-2">
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <PositionFilter value={positionFilter} onChange={setPositionFilter} />
        <PriceSelect value={maxPrice} onChange={setMaxPrice} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {/* ADD NEW COLUMN FOR CREATE MODE */}
            {mode === "create" && <TableHead>Add</TableHead>}
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
              <TableCell colSpan={6} className="text-center py-6">
                No players found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedPlayers.map((p) => (
              <TableRow key={p.id}>
                {/* ADD BUTTON LOGIC */}
                {mode === "create" && (
                  <TableCell>
                    {selected.includes(p.id) ? (
                      <span className="">Added</span>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isAddDisabled(p)}
                        onClick={() => onAddPlayer?.(p.id)}
                      >
                        Add
                      </Button>
                    )}
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.key === "first_name" ? (
                      <a
                        href={`https://www.nba.com/player/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {formatName(p.first_name, p.last_name)}
                      </a>
                    ) : col.key === "position" ? (
                      shortPos(p.position)
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

      {/* Pagination */}
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
