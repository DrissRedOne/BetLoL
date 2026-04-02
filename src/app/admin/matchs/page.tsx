import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminMatchsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Gestion des matchs
        </h1>
        <Link
          href="/admin"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>

      {/* Skeleton match list */}
      <div className="space-y-3">
        {[
          { league: "LCK", status: "live" as const, teams: "T1 vs Gen.G" },
          { league: "LEC", status: "upcoming" as const, teams: "G2 vs Fnatic" },
          { league: "LPL", status: "finished" as const, teams: "JDG vs BLG" },
        ].map((match) => (
          <Card key={match.teams}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge variant="league">{match.league}</Badge>
                <Badge variant={match.status}>
                  {match.status === "live" ? "EN DIRECT" : match.status}
                </Badge>
                <span className="text-sm font-medium truncate">{match.teams}</span>
              </div>
              <Link
                href={`/match/placeholder`}
                className="text-xs text-[var(--accent-cyan)] hover:underline shrink-0"
              >
                Voir
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
