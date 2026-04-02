import Link from "next/link";
import Image from "next/image";
import type { LolMatch, Odd } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OddsDisplay } from "@/components/match/odds-display";
import { formatDate, getTimeUntil } from "@/lib/utils";

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
      <Card className="hover:border-[#00D4FF]/20 transition-all duration-300 cursor-pointer group">
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

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-[#64748B] uppercase tracking-wider">vs</span>
            {match.status === "upcoming" && (
              <span className="text-xs text-[#64748B]">{formatDate(match.starts_at)}</span>
            )}
            {match.best_of > 1 && (
              <span className="text-[10px] text-[#64748B]">BO{match.best_of}</span>
            )}
          </div>

          <TeamDisplay
            name={match.team_b_name}
            logo={match.team_b_logo}
            score={match.status !== "upcoming" ? match.score_b : undefined}
            isWinner={match.winner === "team_b"}
            reverse
          />
        </div>

        {odds && odds.is_active && match.status !== "finished" && match.status !== "cancelled" && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <OddsDisplay odd={odds} />
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
  reverse,
}: {
  name: string;
  logo: string | null;
  score?: number;
  isWinner: boolean;
  reverse?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${reverse ? "order-last" : ""}`}>
      <div className="relative h-12 w-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
        {logo ? (
          <Image src={logo} alt={name} width={48} height={48} className="object-contain p-1" />
        ) : (
          <span className="text-lg font-bold text-[#64748B]">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <span className={`text-sm font-medium text-center leading-tight ${isWinner ? "text-[#00FF87]" : "text-[#E2E8F0]"}`}>
        {name}
      </span>
      {score !== undefined && (
        <span className={`text-lg font-mono font-bold ${isWinner ? "text-[#00FF87]" : "text-[#E2E8F0]"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

export { MatchCard };
