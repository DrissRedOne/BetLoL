export default function WalletLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="h-8 w-40 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="h-36 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
          <div className="h-24 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-8 w-36 rounded-lg bg-white/5 animate-pulse mb-4" />
          <div className="h-80 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
