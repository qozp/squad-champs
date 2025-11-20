import { Card, CardContent, CardTitle } from "~/components/ui/card";

export default function ScoresTab({ squadMeta }: { squadMeta: any }) {
  return (
    <Card className="w-full">
      <CardContent className="px-4">
        <CardTitle className="mb-4">Weekly Scores</CardTitle>
        <p className="text-muted-foreground">
          Coming soon ... will show weekly gameweek scores, rank, highest
          scoring week, etc.
        </p>
      </CardContent>
    </Card>
  );
}
