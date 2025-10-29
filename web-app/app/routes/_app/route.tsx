// app/routes/_landing/route.tsx
import { Link, Outlet, useLoaderData } from "react-router";
import AuthNavbar from "./AuthNavbar";
import PublicNavbar from "./PublicNavbar";
import { createClient } from "~/lib/supabase/server";

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
    <div className="flex flex-col min-h-screen">
      {user ? <AuthNavbar user={user} /> : <PublicNavbar />}
      <main className="flex-1 bg-background">
        <Outlet />
      </main>

      <footer className="flex flex-row justify-center items-center gap-4 py-4 text-center text-sm text-foreground">
        <div className="flex flex-row gap-4 items-center">
          <a
            href="https://squadchamps.com"
            className="hover:underline font-medium"
          >
            Main Site
          </a>
          {/* <a
            href="https://squadchamps.com/blog"
            className="hover:underline font-medium"
          >
            Blog
          </a>
          <a
            href="https://squadchamps.com/careers"
            className="hover:underline font-medium"
          >
            Careers
          </a> */}
        </div>
        <span className="">&copy; {new Date().getFullYear()} Squad Champs</span>
      </footer>
    </div>
  );
}
