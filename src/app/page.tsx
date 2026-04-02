import { createClient } from "@/lib/supabase/server";
import type { LolMatch, Odd } from "@/types";
import { MatchCard } from "@/components/match/match-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getLiveMatches(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("lol_matches")
    .select("*")
    .eq("status", "live")
    .order("starts_at", { ascending: true })
    .limit(6);
  return (data ?? []) as LolMatch[];
}

async function getUpcomingMatches(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("lol_matches")
    .select("*")
    .eq("status", "upcoming")
    .order("starts_at", { ascending: true })
    .limit(9);
  return (data ?? []) as LolMatch[];
}

async function getOddsMap(supabase: SupabaseClient, matchIds: string[]) {
  if (matchIds.length === 0) return {};
  const { data } = await supabase
    .from("odds")
    .select("*")
    .in("match_id", matchIds)
    .eq("bet_type", "match_winner")
    .eq("is_active", true);

  const map: Record<string, Odd> = {};
  for (const odd of (data ?? []) as Odd[]) {
    map[odd.match_id] = odd;
  }
  return map;
}

export default async function HomePage() {
  const supabase = await createClient();

  const [liveMatches, upcomingMatches] = await Promise.all([
    getLiveMatches(supabase),
    getUpcomingMatches(supabase),
  ]);

  const allMatchIds = [...liveMatches, ...upcomingMatches].map((m) => m.id);
  const oddsMap = await getOddsMap(supabase, allMatchIds);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3 sm:text-5xl">
          <span className="text-[#00D4FF]">Pariez</span> sur{" "}
          <span className="text-[#C89B3C]">League of Legends</span>
        </h1>
        <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
          LEC, LCK, LPL, LCS, Worlds, MSI et toutes les ligues régionales.
          Suivez les cotes en direct et pariez sur vos équipes favorites.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/matches">
            <Button size="lg">Voir les matchs</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">Créer un compte</Button>
          </Link>
        </div>
      </section>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="live">EN DIRECT</Badge>
            <h2 className="text-xl font-semibold">Matchs en cours</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} odds={oddsMap[match.id]} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Prochains matchs</h2>
          <Link href="/matches" className="text-sm text-[#00D4FF] hover:underline">
            Voir tout
          </Link>
        </div>
        {upcomingMatches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} odds={oddsMap[match.id]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#64748B]">Aucun match à venir pour le moment</p>
          </div>
        )}
      </section>
    </div>
  );
}
