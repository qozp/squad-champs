import { useUser } from "../root";

export default function Dashboard() {
  const { user } = useUser();

  if (!user) return <p>You must be logged in.</p>;

  return <p>Welcome back, {user.email}!</p>;
}
