// app/components/publicNavbar.tsx
export default function PublicNavbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <div>Logo</div>
      <div className="flex gap-4 items-center">
        <a href="/login">Login</a>
        <a href="/sign-up">Sign Up</a>
      </div>
    </nav>
  );
}
