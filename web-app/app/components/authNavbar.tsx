// app/components/navbar/AuthNavbar.tsx
import type { User } from "@supabase/supabase-js";

interface AuthNavbarProps {
  user: User;
}

export default function AuthNavbar({ user }: AuthNavbarProps) {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <div>Logo</div>
      <div className="flex gap-4 items-center">
        <span>Welcome, {user.email}</span>
        <a href="/dashboard">Dashboard</a>
        <a href="/logout">Logout</a>
      </div>
    </nav>
  );
}
