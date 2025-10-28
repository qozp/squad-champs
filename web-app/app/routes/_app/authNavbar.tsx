// app/components/navbar/AuthNavbar.tsx
import type { User } from "@supabase/supabase-js";
import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import logoLight from "~/assets/logo-light.svg";
import logoDark from "~/assets/logo-dark.svg";
import { Button } from "~/components/ui/button";

interface AuthNavbarProps {
  user: User;
}

export default function AuthNavbar({ user }: AuthNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    // await supabase.auth.signOut({ scope: 'local' })
    // navigate("/");
  };

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
          <NavLinks currentPath={location.pathname} mode="web" />
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
          />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}

/* --- Reusable Components --- */
function NavLinks({
  onClick,
  currentPath,
  mode,
}: {
  onClick?: () => void;
  currentPath?: string;
  mode: string;
}) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/squad", label: "Squad" },
    { href: "/players", label: "Players" },
    { href: "/profile", label: "Profile" },
    { href: "/logout", label: "Logout" },
  ];

  return (
    <div
      className={`flex ${
        mode === "mobile" ? "flex-col items-center gap-3" : "items-center gap-2"
      }`}
    >
      {links.map((link) => {
        const isActive = currentPath === link.href;
        return (
          <Link
            key={link.href}
            to={link.href}
            onClick={onClick}
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-gray-600 grayscale-50 text-navbar"
                  : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
              }`}
          >
            {link.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function ThemeToggle({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  return (
    <div
      onClick={toggleTheme}
      className="relative w-16 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition-colors"
    >
      {/* Sliding circle */}
      <div
        className={`absolute top-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md transform transition-transform ${
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        } flex items-center justify-center`}
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-gray-200" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-400" />
        )}
      </div>

      {/* Static icons */}
      <Sun className="absolute left-2 w-4 h-4 text-yellow-400" />
      <Moon className="absolute right-2 w-4 h-4 text-gray-200" />
    </div>
  );
}
