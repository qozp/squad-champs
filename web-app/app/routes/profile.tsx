import { useUser } from "~/contexts/SessionProvider";

export default function Profile() {
  const user = useUser();

  return (
    <div className="min-h-screen text-foreground">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Profile</h1>

        <div className="text-lg text-foreground">
          <h1>Welcome {user?.email}</h1>
          <p>User ID: {user?.id}</p>
        </div>
      </section>
    </div>
  );
}
