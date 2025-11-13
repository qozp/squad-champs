import PlayersTable from "~/components/players/PlayersTable";
import { Card, CardContent } from "~/components/ui/card";

export function meta() {
  return [
    { title: "Players - Squad Champs" },
    { name: "description", content: "Browse and view player stats." },
  ];
}

// export const loader = async ({ request }: Route.LoaderArgs) => {
//   const user = await requireAuth(request);
//   return { user };
// };

export default function Players() {
  return (
    <div className="flex-1 text-foreground m-4">
      <Card className="">
        <CardContent className="">
          <h1 className="text-4xl font-bold">Browse Players</h1>
          <p className="">
            Explore the top NBA players and their stats. Statistics are updated
            daily from NBA.com.
          </p>
          <PlayersTable />
        </CardContent>
      </Card>
    </div>
  );
}
