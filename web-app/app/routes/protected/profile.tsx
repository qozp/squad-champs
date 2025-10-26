import { useSession, withSessionRedirect } from "~/contexts/SessionProvider";

function ProfilePage() {
  const { session } = useSession();
  const user = session?.user;

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

// Wrap the page with the helper
export default withSessionRedirect(ProfilePage);
