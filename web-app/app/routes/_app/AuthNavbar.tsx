// app/components/navbar/AuthNavbar.tsx
import type { User } from "@supabase/supabase-js";
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoLight from "~/assets/logo-light.svg";
import logoDark from "~/assets/logo-dark.svg";
import { NavLinks, ThemeToggle } from "./NavbarUtils";
import { supabaseBrowser } from "~/lib/supabase/client";
import CreateProfileForm from "~/components/profile/CreateProfileForm";
import { toast } from "sonner";

interface AuthNavbarProps {
  user: User;
}

export default function AuthNavbar({ user }: AuthNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();

  const links = [
    { href: "/home", label: "Home" },
    { href: "/squad", label: "Squad" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/players", label: "Players" },
    { href: "/profile", label: "Profile" },
    { href: "/logout", label: "Logout" },
  ];

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabaseBrowser.rpc("get_user_profile", {});
      if (error) throw error;

      const profileRow = data && data.length > 0 ? data[0] : null;
      setProfile(profileRow);
      setShowDialog(profileRow === null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (loading) {
    // wait for profile to load
    return (
      <p className="flex flex-1 min-h-screen items-center justify-center text-lg text-foreground">
        Loading...
      </p>
    );
  }

  return (
    <nav className="px-5 bg-navbar shadow-md transition-colors duration-300">
      <div className="py-2 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="Squad Champs Logo"
            className="h-8 w-auto"
          />
          <span className="font-semibold text-lg text-navbar-text">
            Squad Champs
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks currentPath={location.pathname} mode="web" links={links} />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4 py-4 border-t border-border bg-navbar/95 backdrop-blur-sm">
          <NavLinks
            currentPath={location.pathname}
            onClick={() => setMenuOpen(false)}
            mode="mobile"
            links={links}
          />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
      <CreateProfileForm
        open={showDialog}
        onClose={() => {}}
        profileData={profile ?? {}}
      />
    </nav>
  );
}
