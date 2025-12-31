import LineupEditor from "./LineupEditor";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../../+types/root";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireAuth(request);
  return { user };
};

export default function LineupTab({ squadPlayers }: { squadPlayers: any[] }) {
  return (
    <Card className="w-full">
      <CardContent className="px-4">
        <CardTitle className="mb-4">Edit Weekly Lineup</CardTitle>
        <LineupEditor initialPlayers={squadPlayers} />
      </CardContent>
    </Card>
  );
}
