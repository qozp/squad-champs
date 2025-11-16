// app/routes/_landing/route.tsx
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router";
import logoLight from "~/assets/logo-light.svg";

// import "./auth.css";

export default function LandingLayout() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
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
