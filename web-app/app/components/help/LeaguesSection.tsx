import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export default function LeaguesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leagues & Cups</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div>
          <h3 className="font-semibold text-foreground">League Types</h3>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Global League</li>
            <li>Private Leagues</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Joining a League</h3>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>Create a team</li>
            <li>Go to the Leagues page</li>
            <li>Enter a league code or create your own league</li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold">Cups</h3>
          <p className="mt-2">Knockout tournaments based on weekly matchups.</p>
        </div>
      </CardContent>
    </Card>
  );
}
