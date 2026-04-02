export default function MesBetsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="h-8 w-32 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-56 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
