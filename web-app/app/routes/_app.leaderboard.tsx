import { redirect } from "react-router";

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  // Only redirect if user hits /leaderboard exactly
  if (url.pathname === "/leaderboard") {
    throw redirect("/leaderboard/global");
  }

  return null;
}
