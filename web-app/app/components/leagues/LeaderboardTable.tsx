// app/components/leagues/LeaderboardTable.tsx
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { sanitizeInput } from "~/lib/moderation";
import { Link } from "react-router";

interface Squad {
  user_id: string;
  squad_name: string;
  display_name: string;
  total_points?: number;
  gameweek_points?: number;
  created_at: string;
  rank?: number;
}

interface LeaderboardTableProps {
  data: Squad[];
  gameweek: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  isWeekly?: boolean;
}

export default function LeaderboardTable({
  data,
  gameweek,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  isWeekly = false,
}: LeaderboardTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Squad>(
    isWeekly ? "gameweek_points" : "total_points"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const [rankedData] = useState(() => {
    return [...data]
      .sort((a, b) => {
        const aPts = isWeekly ? a.gameweek_points : a.total_points;
        const bPts = isWeekly ? b.gameweek_points : b.total_points;
        return (bPts ?? 0) - (aPts ?? 0);
      })
      .map((s, index) => ({
        ...s,
        rank: index + 1,
      }));
  });

  const filteredData = useMemo(() => {
    if (!search.trim()) return rankedData;
    const q = search.toLowerCase();
    return rankedData.filter((s) => s.squad_name.toLowerCase().includes(q));
  }, [rankedData, search]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortBy] ?? "";
      const valB = b[sortBy] ?? "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortBy, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (column: keyof Squad) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setPage(1); // Reset to first page
  };

  // Reset page when data changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [sortBy, sortDirection]);

  const pointsColumn = isWeekly ? "gameweek_points" : "total_points";
  const pointsLabel = isWeekly ? "Gameweek Points" : "Total Points";

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search squads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        {showPageSizeSelector && (
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("squad_name")}
            >
              Squad Name{" "}
              {sortBy === "squad_name"
                ? sortDirection === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("display_name")}
            >
              Display Name{" "}
              {sortBy === "display_name"
                ? sortDirection === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort(pointsColumn as keyof Squad)}
            >
              {pointsLabel}{" "}
              {sortBy === pointsColumn
                ? sortDirection === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No squads found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((s) => (
              <TableRow key={s.user_id}>
                <TableCell className="font-medium">{s.rank}</TableCell>
                <TableCell>
                  <Link
                    to={`/squad/${s.user_id}/week/${gameweek}`}
                    className="font-medium hover:underline underline-offset-4"
                  >
                    {sanitizeInput(s.squad_name)}
                  </Link>
                </TableCell>
                <TableCell>{sanitizeInput(s.display_name)}</TableCell>
                <TableCell>
                  {isWeekly ? s.gameweek_points : s.total_points}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
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
