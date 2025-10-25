import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("players", "routes/players.tsx"),
    route("squad", "routes/squad.tsx"),
    route("login", "routes/login.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    // Add more pages here
] satisfies RouteConfig;
