import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { LolMatch, Odd } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateFull, getTimeUntil } from "@/lib/utils";
import Image from "next/image";
import { MatchOddsClient } from "./match-odds-client";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: matchRaw } = await supabase
    .from("lol_matches")
    .select("*")
    .eq("id", id)
    .single();

  if (!matchRaw) notFound();
  const match = matchRaw as unknown as LolMatch;

  const { data: oddsRaw } = await supabase
    .from("odds")
    .select("*")
    .eq("match_id", id)
    .eq("is_active", true)
    .order("bet_type");

  const initialOdds = (oddsRaw ?? []) as unknown as Odd[];

  const statusBadge = {
    upcoming: { variant: "upcoming" as const, label: getTimeUntil(match.starts_at) },
    live: { variant: "live" as const, label: "EN DIRECT" },
    finished: { variant: "finished" as const, label: "Terminé" },
    cancelled: { variant: "cancelled" as const, label: "Annulé" },
  }[match.status];

  const canBet = match.status === "upcoming" || match.status === "live";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Match header */}
      <Card className="mb-6" glass>
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Badge variant="league">{match.league}</Badge>
          {match.tournament && (
            <span className="text-xs text-[var(--text-muted)]">{match.tournament}</span>
          )}
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            BO{match.best_of}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 sm:gap-8">
          <TeamHeader
            name={match.team_a_name}
            logo={match.team_a_logo}
            score={match.status !== "upcoming" ? match.score_a : undefined}
            isWinner={match.winner === "team_a"}
          />

          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-2xl font-bold text-[var(--text-muted)]">VS</span>
            <span className="text-xs text-[var(--text-muted)] text-center">
              {formatDateFull(match.starts_at)}
            </span>
          </div>

          <TeamHeader
            name={match.team_b_name}
            logo={match.team_b_logo}
            score={match.status !== "upcoming" ? match.score_b : undefined}
            isWinner={match.winner === "team_b"}
          />
        </div>
      </Card>

      {/* Odds + bet slip */}
      <MatchOddsClient
        match={match}
        initialOdds={initialOdds}
        canBet={canBet}
      />
    </div>
  );
}

function TeamHeader({
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
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            width={80}
            height={80}
            className="object-contain p-2"
          />
        ) : (
          <span className="text-2xl font-bold text-[var(--text-muted)]">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <span
        className={`text-base sm:text-lg font-semibold text-center truncate max-w-full ${
          isWinner ? "text-[var(--accent-green)]" : ""
        }`}
      >
        {name}
      </span>
      {score !== undefined && (
        <span
          className={`text-2xl sm:text-3xl font-[family-name:var(--font-mono)] font-bold ${
            isWinner ? "text-[var(--accent-green)]" : ""
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}
