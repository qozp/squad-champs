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
import { useState, useMemo } from "react";

interface Squad {
  user_id: string;
  squad_name: string;
  display_name: string;
  total_points: number;
  created_at: string;
}

interface LeaderboardTableProps {
  data: Squad[];
  pageSize?: number;
}

export default function LeaderboardTable({
  data,
  pageSize = 10,
}: LeaderboardTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Squad>("total_points");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    let filtered = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((s) =>
        `${s.squad_name} ${s.display_name}`.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [data, search]);

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

  return (
    <div>
      <Input
        placeholder="Search squads or users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm mb-4"
      />

      <Table>
        <TableHeader>
          <TableRow>
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
              onClick={() => handleSort("total_points")}
            >
              Total Points{" "}
              {sortBy === "total_points"
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
              <TableCell colSpan={3} className="text-center py-6">
                No squads found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((s) => (
              <TableRow key={s.user_id}>
                <TableCell>{s.squad_name}</TableCell>
                <TableCell>{s.display_name}</TableCell>
                <TableCell>{s.total_points}</TableCell>
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
