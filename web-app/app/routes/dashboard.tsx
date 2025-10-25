import { useSession } from "../contexts/SessionProvider";

export default function Dashboard() {
  const { user, session, loading } = useSession();

  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <p>User ID: {user?.id}</p>
    </div>
  );
}
