// app/routes/_landing/route.tsx
import { Link, Outlet } from "react-router";
import logoLight from "~/assets/logo-light.svg";

// import "./auth.css";

export default function LandingLayout() {
  return (
    <div className="auth-layout flex flex-col min-h-screen">
      <nav className="px-5 bg-navbar shadow-md transition-colors duration-300">
        <div className="container py-2 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoLight}
              alt="Squad Champs Logo"
              className="h-8 w-auto"
            />
            <span className="font-semibold text-lg text-navbar-text">
              Squad Champs
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-10 bg-background">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-sm">
        © {new Date().getFullYear()} Squad Champs
      </footer>
    </div>
  );
}
