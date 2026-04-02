export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-[320px] rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
