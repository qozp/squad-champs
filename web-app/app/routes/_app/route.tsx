// app/routes/_landing/route.tsx
import { Outlet, useLoaderData } from "react-router";
import AuthNavbar from "./AuthNavbar";
import PublicNavbar from "./PublicNavbar";
import { createClient } from "~/lib/supabase/server";

export async function loader({ request }) {
  const { supabase } = createClient(request);
  const { data } = await supabase.auth.getUser();
  return { user: data.user || null };
}

export default function LandingLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen">
      {user ? <AuthNavbar user={user} /> : <PublicNavbar />}
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-sm">
        © {new Date().getFullYear()} Squad Champs
      </footer>
    </div>
  );
}
