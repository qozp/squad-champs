// app/routes/_landing/route.tsx
import { Link, Outlet, useLoaderData } from "react-router";
import AuthNavbar from "./AuthNavbar";
import PublicNavbar from "./PublicNavbar";
import { createSupabaseClient } from "~/lib/supabase/server";
import Footer from "./Footer";
import Footer from "./Footer";

type LoaderArgs = {
  request: Request;
};

export async function loader({ request }: LoaderArgs) {
  const { supabase } = createSupabaseClient(request);
  const { data } = await supabase.auth.getUser();
  return { user: data.user || null };
}

export default function LandingLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex flex-col min-h-screen bg-background">
        {user ? <AuthNavbar user={user} /> : <PublicNavbar />}
        <main className="h-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
