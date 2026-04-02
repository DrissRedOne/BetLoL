import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { LolMatch, Odd } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateFull, getTimeUntil, formatOdd } from "@/lib/utils";
import { BET_TYPES } from "@/lib/constants";
import { MatchDetailClient } from "./match-detail-client";
import Image from "next/image";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("lol_matches")
    .select("*")
    .eq("id", id)
    .single();

  if (!match) notFound();

  const typedMatch = match as LolMatch;

  const { data: odds } = await supabase
    .from("odds")
    .select("*")
    .eq("match_id", id)
    .eq("is_active", true)
    .order("bet_type");

  const typedOdds = (odds ?? []) as Odd[];

  const { data: userData } = await supabase.auth.getUser();
  let balance = 0;
  if (userData?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userData.user.id)
      .single();
    balance = profile?.balance ?? 0;
  }

  const statusBadge = {
    upcoming: { variant: "upcoming" as const, label: getTimeUntil(typedMatch.starts_at) },
    live: { variant: "live" as const, label: "EN DIRECT" },
    finished: { variant: "finished" as const, label: "Terminé" },
    cancelled: { variant: "cancelled" as const, label: "Annulé" },
  }[typedMatch.status];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Match header */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="league">{typedMatch.league}</Badge>
          {typedMatch.tournament && (
            <span className="text-xs text-[#64748B]">{typedMatch.tournament}</span>
          )}
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col items-center flex-1">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden mb-2">
              {typedMatch.team_a_logo ? (
                <Image src={typedMatch.team_a_logo} alt={typedMatch.team_a_name} width={80} height={80} className="object-contain p-2" />
              ) : (
                <span className="text-2xl font-bold text-[#64748B]">{typedMatch.team_a_name.charAt(0)}</span>
              )}
            </div>
            <span className={`text-lg font-semibold ${typedMatch.winner === "team_a" ? "text-[#00FF87]" : ""}`}>
              {typedMatch.team_a_name}
            </span>
            {typedMatch.status !== "upcoming" && (
              <span className={`text-2xl font-mono font-bold mt-1 ${typedMatch.winner === "team_a" ? "text-[#00FF87]" : ""}`}>
                {typedMatch.score_a}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl text-[#64748B]">VS</span>
            <span className="text-xs text-[#64748B]">BO{typedMatch.best_of}</span>
            <span className="text-xs text-[#64748B]">{formatDateFull(typedMatch.starts_at)}</span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden mb-2">
              {typedMatch.team_b_logo ? (
                <Image src={typedMatch.team_b_logo} alt={typedMatch.team_b_name} width={80} height={80} className="object-contain p-2" />
              ) : (
                <span className="text-2xl font-bold text-[#64748B]">{typedMatch.team_b_name.charAt(0)}</span>
              )}
            </div>
            <span className={`text-lg font-semibold ${typedMatch.winner === "team_b" ? "text-[#00FF87]" : ""}`}>
              {typedMatch.team_b_name}
            </span>
            {typedMatch.status !== "upcoming" && (
              <span className={`text-2xl font-mono font-bold mt-1 ${typedMatch.winner === "team_b" ? "text-[#00FF87]" : ""}`}>
                {typedMatch.score_b}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Odds and betting */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Cotes disponibles</h2>
          {typedOdds.length > 0 ? (
            typedOdds.map((odd) => (
              <Card key={odd.id}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#E2E8F0]">
                    {BET_TYPES[odd.bet_type]}
                    {odd.map_number && ` — Map ${odd.map_number}`}
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
                    <p className="text-xs text-[#64748B] mb-1">{odd.label_a}</p>
                    <p className="font-mono font-semibold text-[#C89B3C]">{formatOdd(odd.odd_a)}</p>
                  </div>
                  <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
                    <p className="text-xs text-[#64748B] mb-1">{odd.label_b}</p>
                    <p className="font-mono font-semibold text-[#C89B3C]">{formatOdd(odd.odd_b)}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-[#64748B] py-4">
                Aucune cote disponible pour ce match
              </p>
            </Card>
          )}
        </div>

        <div>
          {typedOdds.length > 0 && (typedMatch.status === "upcoming" || typedMatch.status === "live") && (
            <MatchDetailClient
              matchId={typedMatch.id}
              match={typedMatch}
              odds={typedOdds}
              initialBalance={balance}
              isAuthenticated={!!userData?.user}
            />
          )}
        </div>
      </div>
    </div>
  );
}
