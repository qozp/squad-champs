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
  return (
    <div className="min-h-screen text-foreground">
      <section className="px-10 py-10">
        <h1 className="text-4xl font-bold mb-8">Browse Players</h1>
        <p className="mb-6">
          Explore the top NBA players and their stats. Click on a header to
          sort.
        </p>
        <PlayersTable />
      </section>
    </div>
  );
}
