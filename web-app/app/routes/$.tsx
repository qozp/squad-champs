// app/routes/$qqs.tsx (or app/routes/not-found.tsx)
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import logoLight from "~/assets/logo-light.svg";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <Link to="/" className="flex items-center gap-2">
        <img src={logoLight} alt="Squad Champs Logo" className="h-48 w-auto" />
      </Link>
      <p className="text-lg text-foreground mb-8">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="px-5 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        <Button size="lg" variant="default">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
