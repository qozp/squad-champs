import Navbar from "~/components/navbar";

export function meta() {
  return [
    { title: "My Squad - Squad Champs" },
    { name: "description", content: "View and manage your fantasy squad." },
  ];
}

export default function Squad() {
  return (
    <div className="min-h-screen text-foreground">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">My Squad</h1>
        <p className="text-lg text-foreground">
          Manage your players and track your performance.
        </p>
      </section>
    </div>
  );
}
