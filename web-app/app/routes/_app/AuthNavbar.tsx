// app/components/navbar/AuthNavbar.tsx
import type { User } from "@supabase/supabase-js";
import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoLight from "~/assets/logo-light.svg";
import logoDark from "~/assets/logo-dark.svg";
import { NavLinks, ThemeToggle } from "./NavbarUtils";
import { supabaseBrowser } from "~/lib/supabase/client";
import CreateProfileForm from "~/components/profile/CreateProfileForm";
import { getEasternSportsDate } from "~/lib/helpers/gameweek";

interface AuthNavbarProps {
  user: User;
}

type DropdownType = "squad" | "account" | null;

export default function AuthNavbar({ user }: AuthNavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<DropdownType>(null);
  const [mobileDropdown, setMobileDropdown] = useState<DropdownType>(null);

  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number>(1);
  const location = useLocation();
  const dropdownRefs = {
    squad: useRef<HTMLDivElement>(null),
    account: useRef<HTMLDivElement>(null),
  };

  const squadLinks = [
    { href: "/squad/lineup", label: "Lineup" },
    { href: "/squad/trades", label: "Trades" },
    { href: `/squad/${user.id}/week/${currentGameweek}`, label: "Scores" },
  ];

  const accountLinks = [
    { href: "/profile", label: "Profile" },
    { href: "/logout", label: "Logout" },
  ];

  const mainLinks = [
    // { href: "/home", label: "Home" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/players", label: "Players" },
    { href: "/help", label: "Help" },
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

  const fetchCurrentGameweek = async () => {
    try {
      const today = getEasternSportsDate();

      const { data } = await supabaseBrowser
        .from("gameweek")
        .select("gameweek")
        .lte("start_date", today)
        .gte("end_date", today)
        .maybeSingle();

      if (data) setCurrentGameweek(data.gameweek);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCurrentGameweek();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedOutsideAll = Object.values(dropdownRefs).every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );
      if (clickedOutsideAll) {
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

  const toggleDesktopDropdown = (dropdown: DropdownType) => {
    setDesktopDropdown(desktopDropdown === dropdown ? null : dropdown);
  };

  const toggleMobileDropdown = (dropdown: DropdownType) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown);
  };

  const isHomeActive = location.pathname === "/home";

  if (loading) {
    // wait for profile to load
    return (
      <p className="flex flex-1 min-h-screen items-center justify-center text-lg text-foreground">
        Loading...
      </p>
    );
  }

  const isSquadActive = location.pathname.startsWith("/squad");
  const isAccountActive =
    location.pathname === "/profile" || location.pathname === "/logout";

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
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/home"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isHomeActive
                  ? "bg-gray-600 grayscale-50 text-navbar"
                  : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
              }`}
          >
            Home
            {isHomeActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>
          {/* Squad Dropdown */}
          <div className="relative" ref={dropdownRefs.squad}>
            <button
              onClick={() => toggleDesktopDropdown("squad")}
              className={`cursor-pointer relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1
                ${
                  isSquadActive
                    ? "bg-gray-600 grayscale-50 text-navbar"
                    : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
                }`}
            >
              Squad
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  desktopDropdown === "squad" ? "rotate-180" : ""
                }`}
              />
              {isSquadActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
              )}
            </button>

            {desktopDropdown === "squad" && (
              <div className="absolute top-full left-0 w-40 bg-card border border-border rounded-md shadow-lg z-50">
                {squadLinks.map((link) => (
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
          {mainLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
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
          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRefs.account}>
            <button
              onClick={() => toggleDesktopDropdown("account")}
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1
                ${
                  isAccountActive
                    ? "bg-gray-600 grayscale-50 text-navbar"
                    : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
                }`}
            >
              Account
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  desktopDropdown === "account" ? "rotate-180" : ""
                }`}
              />
              {isAccountActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
              )}
            </button>

            {desktopDropdown === "account" && (
              <div className="absolute top-full right-0 w-40 bg-card border border-border rounded-md shadow-lg z-50">
                {accountLinks.map((link) => (
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
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden cursor-pointer text-gray-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Hamburger */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center gap-3 py-4 border-t border-border bg-navbar/95 backdrop-blur-sm">
          <Link
            to="/home"
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isHomeActive
                  ? "bg-gray-600 grayscale-50 text-navbar"
                  : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
              }`}
          >
            Home
            {isHomeActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
            )}
          </Link>

          {/* Mobile Squad Section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => toggleMobileDropdown("squad")}
              className={`cursor-pointer relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1
                ${
                  isSquadActive
                    ? "bg-gray-600 grayscale-50 text-navbar"
                    : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
                }`}
            >
              Squad
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  mobileDropdown === "squad" ? "rotate-180" : ""
                }`}
              />
              {isSquadActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
              )}
            </button>

            {mobileDropdown === "squad" && (
              <div className="flex flex-col items-center gap-2">
                {squadLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3 py-1 text-sm text-navbar/80 hover:bg-gray-500 hover:text-navbar transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {mainLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
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

          {/* Mobile Account Section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => toggleMobileDropdown("account")}
              className={`cursor-pointer relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1
                ${
                  isAccountActive
                    ? "bg-gray-600 grayscale-50 text-navbar"
                    : "text-navbar/80 hover:bg-gray-500 hover:text-navbar"
                }`}
            >
              Account
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  mobileDropdown === "account" ? "rotate-180" : ""
                }`}
              />
              {isAccountActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-secondary rounded-full"></span>
              )}
            </button>

            {mobileDropdown === "account" && (
              <div className="flex flex-col items-center gap-2">
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3 py-1 text-sm text-navbar/80 hover:bg-gray-500 hover:text-navbar transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
