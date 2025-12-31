import { redirect } from "react-router";

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  // Only redirect if user hits /leaderboard exactly
  if (url.pathname === "/leaderboard") {
    throw redirect("/leaderboard/global");
  }

  return null;
}

// // app/routes/leaderboard.tsx
// import { useEffect, useState } from "react";
// import { supabaseBrowser } from "~/lib/supabase/client";
// import LeaderboardTable from "~/components/leagues/LeaderboardTable";
// import WeeklyLeaderboard from "~/components/leagues/WeeklyLeaderboard";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardTitle,
// } from "~/components/ui/card";
// import { getEasternSportsDate } from "~/lib/helpers/gameweek";

// export default function Leaderboard() {
//   const [squads, setSquads] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentGameweek, setCurrentGameweek] = useState<number>(1);

//   const fetchSquads = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabaseBrowser.rpc("get_leaderboard");
//       if (error) throw error;
//       setSquads(data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSquads();
//   }, []);

//   useEffect(() => {
//     async function loadGameweek() {
//       const today = getEasternSportsDate();

//       const { data } = await supabaseBrowser
//         .from("gameweek")
//         .select("gameweek, start_date, end_date")
//         .lte("start_date", today)
//         .gte("end_date", today)
//         .maybeSingle();

//       setCurrentGameweek(data?.gameweek ?? 1);
//     }

//     loadGameweek();
//   }, []);

//   if (loading)
//     return (
//       <p className="flex flex-1 items-center min-h-screen justify-center text-lg text-foreground">
//         Loading Leaderboard...
//       </p>
//     );

//   return (
//     <div className="flex-1 text-foreground m-4">
//       <div className="flex flex-col gap-4">
//         {/* Global Leaderboard */}
//         <Card className="flex-1">
//           <CardContent>
//             <CardTitle>Global Leaderboard</CardTitle>
//             <CardDescription className="text-lg mb-4">
//               View top squads and their total points.
//             </CardDescription>
//             <LeaderboardTable data={squads} gameweek={currentGameweek} />
//           </CardContent>
//         </Card>

//         {/* Weekly Leaderboard */}
//         <div className="flex-1">
//           <WeeklyLeaderboard currentGameweek={currentGameweek} />
//         </div>
//       </div>
//     </div>
//   );
// }
