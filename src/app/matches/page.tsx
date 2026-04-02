import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const leagues = ["Tous", "LCK", "LEC", "LPL", "LCS", "LFL", "Worlds"];
const statuses = ["Tous", "En direct", "À venir", "Terminés"];

export default function MatchesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">
        Tous les matchs
      </h1>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        {statuses.map((status, i) => (
          <button
            key={status}
            type="button"
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
              i === 0
                ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)]"
                : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* League filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        {leagues.map((league, i) => (
          <button
            key={league}
            type="button"
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer border ${
              i === 0
                ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border-[var(--accent-gold)]/40"
                : "bg-white/5 text-[var(--text-muted)] border-transparent hover:bg-white/10"
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Skeleton match cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="league">{leagues[(i % 6) + 1]}</Badge>
              <Badge variant={i < 2 ? "live" : "upcoming"}>
                {i < 2 ? "EN DIRECT" : "À venir"}
              </Badge>
            </div>
            <div className="h-24 rounded-lg bg-white/[0.02] border border-[var(--border-subtle)] flex items-center justify-center">
              <span className="text-sm text-[var(--text-muted)]">Match skeleton</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
