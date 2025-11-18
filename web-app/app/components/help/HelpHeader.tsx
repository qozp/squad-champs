export default function HelpHeader() {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Squad Champs
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          Help &amp; Game Rules
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Learn how to play Squad Champs, build your NBA fantasy squad, and
          compete on weekly and seasonal leaderboards.
        </p>
      </div>
    </header>
  );
}
