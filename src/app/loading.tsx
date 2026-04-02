export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
