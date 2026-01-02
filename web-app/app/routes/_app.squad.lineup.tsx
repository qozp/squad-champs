import { Card, CardContent, CardTitle } from "~/components/ui/card";
import LineupEditor from "~/components/squad/LineupEditor";
import { useOutletContext } from "react-router";

export default function LineupRoute() {
  const { squadPlayers } = useOutletContext<any>();

  if (!squadPlayers || squadPlayers.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="px-4">
          <CardTitle className="mb-4">Edit Weekly Lineup</CardTitle>
          <LineupEditor initialPlayers={squadPlayers} />
        </CardContent>
      </Card>
    );
  }
}
