import LineupEditor from "./LineupEditor";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

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
