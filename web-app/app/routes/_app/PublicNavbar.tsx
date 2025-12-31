import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import logoLight from "~/assets/logo-light.svg";
import logoDark from "~/assets/logo-dark.svg";
import { NavLinks, ThemeToggle } from "./NavbarUtils";

export default function PublicNavbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  type DropdownType = "leaderboard" | null;

  const [desktopDropdown, setDesktopDropdown] = useState<DropdownType>(null);
  const [mobileDropdown, setMobileDropdown] = useState<DropdownType>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const leaderboardLinks = [
    { href: "/leaderboard/global", label: "Global" },
    { href: "/leaderboard/weekly", label: "Weekly" },
  ];

  const links = [
    { href: "/", label: "Home" },
    { href: "/players", label: "Players" },
    { href: "/help", label: "Help" },
    { href: "/login", label: "Login" },
  ];

  const isLeaderboardActive = location.pathname.startsWith("/leaderboard");

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

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDesktopDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setDesktopDropdown(null);
    setMobileDropdown(null);
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="px-5 bg-navbar shadow-md transition-colors duration-300">
      <div className="mt-1 py-1 flex justify-between items-center">
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
        <div className="hidden md:flex items-center gap-1">
          {/* Home */}
          <Link
            to="/"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
      ${
        location.pathname === "/"
          ? "bg-gray-600 grayscale-50 text-navbar"
          : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
      }`}
          >
            Home
            {location.pathname === "/" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>

          {/* Players */}
          <Link
            to="/players"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
      ${
        location.pathname === "/players"
          ? "bg-gray-600 grayscale-50 text-navbar"
          : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
      }`}
          >
            Players
            {location.pathname === "/players" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>

          {/* Leaderboard Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() =>
                setDesktopDropdown(
                  desktopDropdown === "leaderboard" ? null : "leaderboard"
                )
              }
              className={`cursor-pointer relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1
        ${
          isLeaderboardActive
            ? "bg-gray-600 grayscale-50 text-navbar"
            : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
        }`}
            >
              Leaderboard
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  desktopDropdown === "leaderboard" ? "rotate-180" : ""
                }`}
              />
              {isLeaderboardActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full" />
              )}
            </button>

            {desktopDropdown === "leaderboard" && (
              <div className="absolute top-full left-0 w-40 bg-card border border-border rounded-md shadow-lg z-50">
                {leaderboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <Link
            to="/help"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
      ${
        location.pathname === "/help"
          ? "bg-gray-600 grayscale-50 text-navbar"
          : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
      }`}
          >
            Help
            {location.pathname === "/help" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>

          {/* Login */}
          <Link
            to="/login"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
      ${
        location.pathname === "/login"
          ? "bg-gray-600 grayscale-50 text-navbar"
          : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
      }`}
          >
            Login
            {location.pathname === "/login" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>

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
        <div className="flex flex-col items-center gap-3 py-4 border-t border-border bg-navbar/95 backdrop-blur-sm">
          <Link
            to="/"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
    ${
      location.pathname === "/"
        ? "bg-gray-600 grayscale-50 text-navbar"
        : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
    }`}
          >
            Home
          </Link>

          <Link
            to="/players"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
    ${
      location.pathname === "/players"
        ? "bg-gray-600 grayscale-50 text-navbar"
        : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
    }`}
          >
            Players
          </Link>

          {/* Mobile Leaderboard Section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() =>
                setMobileDropdown(
                  mobileDropdown === "leaderboard" ? null : "leaderboard"
                )
              }
              className={`cursor-pointer relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
      flex items-center gap-1
      ${
        isLeaderboardActive
          ? "bg-gray-600 grayscale-50 text-navbar"
          : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
      }`}
            >
              Leaderboard
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  mobileDropdown === "leaderboard" ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileDropdown === "leaderboard" && (
              <div className="flex flex-col items-center gap-2">
                {leaderboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-3 py-1 text-sm text-navbar/80 rounded-md hover:bg-gray-500 hover:text-navbar transition-colors
            ${
              location.pathname === link.href
                ? "bg-gray-600 grayscale-50 text-navbar"
                : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
            }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/help"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
    ${
      location.pathname === "/help"
        ? "bg-gray-600 grayscale-50 text-navbar"
        : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
    }`}
          >
            Help
          </Link>

          <Link
            to="/login"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
    ${
      location.pathname === "/login"
        ? "bg-gray-600 grayscale-50 text-navbar"
        : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
    }`}
          >
            Login
          </Link>

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}
