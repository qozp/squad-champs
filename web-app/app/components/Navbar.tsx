import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import logoLight from "../assets/logo-light.svg";
import logoDark from "../assets/logo-dark.svg";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-md z-50 transition-colors duration-300">
      <div className="container mx-auto py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logoDark} alt="Squad Champs Logo" className="h-8 w-auto" />
          <span className="font-semibold text-lg text-gray-100">
            Squad Champs
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
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
        <div className="flex flex-col items-center gap-4 py-4 border-t border-gray-700 bg-gray-900">
          <NavLinks onClick={() => setMenuOpen(false)} />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}

/* --- Reusable Components --- */

function NavLinks({ onClick }: { onClick?: () => void }) {
  const base = "text-gray-200 hover:text-primary transition-colors";
  return (
    <>
      <Link to="/" onClick={onClick} className={base}>
        Home
      </Link>
      <Link to="/squad" onClick={onClick} className={base}>
        Squad
      </Link>
      <Link to="/players" onClick={onClick} className={base}>
        Players
      </Link>
    </>
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
