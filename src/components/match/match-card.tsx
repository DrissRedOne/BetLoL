import Link from "next/link";
import Image from "next/image";
import type { LolMatch, Odd } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getTimeUntil, formatOdd } from "@/lib/utils";

interface MatchCardProps {
  match: LolMatch;
  odds?: Odd;
}

function MatchCard({ match, odds }: MatchCardProps) {
  const statusBadge = {
    upcoming: { variant: "upcoming" as const, label: getTimeUntil(match.starts_at) },
    live: { variant: "live" as const, label: "EN DIRECT" },
    finished: { variant: "finished" as const, label: "Terminé" },
    cancelled: { variant: "cancelled" as const, label: "Annulé" },
  }[match.status];

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:border-[var(--accent-cyan)]/20 transition-all duration-300 cursor-pointer group h-full">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="league">{match.league}</Badge>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>

        <div className="flex items-center justify-between gap-4">
          <TeamDisplay
            name={match.team_a_name}
            logo={match.team_a_logo}
            score={match.status !== "upcoming" ? match.score_a : undefined}
            isWinner={match.winner === "team_a"}
          />

          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">vs</span>
            {match.status === "upcoming" && (
              <span className="text-[10px] text-[var(--text-muted)]">{formatDate(match.starts_at)}</span>
            )}
            {match.best_of > 1 && (
              <span className="text-[10px] text-[var(--text-muted)]">BO{match.best_of}</span>
            )}
          </div>

          <TeamDisplay
            name={match.team_b_name}
            logo={match.team_b_logo}
            score={match.status !== "upcoming" ? match.score_b : undefined}
            isWinner={match.winner === "team_b"}
          />
        </div>

        {odds && odds.is_active && match.status !== "finished" && match.status !== "cancelled" && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex gap-2">
            <div className="flex-1 rounded-md border border-[var(--border-subtle)] bg-white/[0.02] px-2 py-1.5 text-center group-hover:border-[var(--accent-cyan)]/20 transition-colors">
              <p className="text-[10px] text-[var(--text-muted)] truncate">{odds.label_a}</p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--accent-gold)]">
                {formatOdd(odds.odd_a)}
              </p>
            </div>
            <div className="flex-1 rounded-md border border-[var(--border-subtle)] bg-white/[0.02] px-2 py-1.5 text-center group-hover:border-[var(--accent-cyan)]/20 transition-colors">
              <p className="text-[10px] text-[var(--text-muted)] truncate">{odds.label_b}</p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--accent-gold)]">
                {formatOdd(odds.odd_b)}
              </p>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}

function TeamDisplay({
  name,
  logo,
  score,
  isWinner,
}: {
  name: string;
  logo: string | null;
  score?: number;
  isWinner: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
        {logo ? (
          <Image src={logo} alt={name} width={48} height={48} className="object-contain p-1" />
        ) : (
          <span className="text-lg font-bold text-[var(--text-muted)]">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <span className={`text-xs font-medium text-center leading-tight truncate max-w-full ${isWinner ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"}`}>
        {name}
      </span>
      {score !== undefined && (
        <span className={`text-lg font-[family-name:var(--font-mono)] font-bold ${isWinner ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

export { MatchCard };
