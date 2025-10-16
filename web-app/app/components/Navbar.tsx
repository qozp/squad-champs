import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
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
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-primary dark:text-white"
        >
          Squad Champs
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link
            to="/squad"
            className="text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Squad
          </Link>
          <Link
            to="/players"
            className="text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Players
          </Link>

          {/* Toggle switch with sun/moon icons */}
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
        </div>
      </div>
    </nav>
  );
}
