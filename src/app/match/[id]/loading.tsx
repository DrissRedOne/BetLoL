export default function MatchDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header skeleton */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 mb-6 animate-pulse">
        <div className="flex gap-2 mb-6">
          <div className="h-5 w-12 rounded-full bg-white/5" />
          <div className="h-5 w-20 rounded-full bg-white/5" />
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-20 w-20 rounded-full bg-white/5" />
            <div className="h-5 w-24 rounded bg-white/5" />
          </div>
          <div className="h-8 w-12 rounded bg-white/5" />
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-20 w-20 rounded-full bg-white/5" />
            <div className="h-5 w-24 rounded bg-white/5" />
          </div>
        </div>
      </div>
      {/* Odds skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse hidden lg:block" />
      </div>
    </div>
  );
}
