import PlayersTable from "~/components/players/PlayersTable";

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
    <div className="min-h-screen text-foreground">
      <section className="p-10">
        <h1 className="text-4xl font-bold mb-8">Browse Players</h1>
        <p className="mb-6">
          Explore the top NBA players and their stats. All statistics are from
          NBA.com.
        </p>
        <PlayersTable />
      </section>
    </div>
  );
}
