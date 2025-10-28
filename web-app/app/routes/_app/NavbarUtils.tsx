// app/components/navbar/NavComponents.tsx
import { Link } from "react-router";
import { Sun, Moon } from "lucide-react";

export function NavLinks({
  onClick,
  currentPath,
  mode,
  links,
}: {
  onClick?: () => void;
  currentPath?: string;
  mode: "mobile" | "web";
  links: { href: string; label: string }[];
}) {
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

export function ThemeToggle({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-background hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-md"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌚" : "🌝"}
      {/* {theme === "dark" ? (
        <Moon className="w-5 h-5 text-gray-200" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )} */}
    </button>
  );
}

// Sliding Toggle, hard to format on multiple viewports
// export function ThemeToggle({
//   theme,
//   toggleTheme,
// }: {
//   theme: "light" | "dark";
//   toggleTheme: () => void;
// }) {
//   return (
//     <div
//       onClick={toggleTheme}
//       className="relative w-16 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition-colors"
//     >
//       <div
//         className={`absolute top-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md transform transition-transform ${
//           theme === "dark" ? "translate-x-8" : "translate-x-0"
//         } flex items-center justify-center`}
//       >
//         {/* {theme === "dark" ? "🌚" : "🌝"} */}
//         {/* {theme === "dark" ? (
//           <Moon className="w-4 h-4 text-gray-200" />
//         ) : (
//           <Sun className="w-4 h-4 text-yellow-400" />
//         )} */}
//       </div>
//       {/* <Sun className="absolute left-2 w-4 h-4 text-yellow-400" />
//       <Moon className="absolute right-2 w-4 h-4 text-gray-200" /> */}
//       <span className="absolute left-2 text-base">🌝</span>
//       <span className="absolute right-2 text-base">🌚</span>
//     </div>
//   );
// }
