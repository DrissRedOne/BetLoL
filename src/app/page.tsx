import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LolMatch, Odd } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/match/match-card";
import { Swords } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: liveRaw }, { data: upcomingRaw }] = await Promise.all([
    supabase
      .from("lol_matches")
      .select("*")
      .eq("status", "live")
      .order("starts_at", { ascending: true })
      .limit(6),
    supabase
      .from("lol_matches")
      .select("*")
      .eq("status", "upcoming")
      .order("starts_at", { ascending: true })
      .limit(9),
  ]);

  const liveMatches = (liveRaw ?? []) as unknown as LolMatch[];
  const upcomingMatches = (upcomingRaw ?? []) as unknown as LolMatch[];

  const allIds = [...liveMatches, ...upcomingMatches].map((m) => m.id);
  const oddsMap: Record<string, Odd> = {};

  if (allIds.length > 0) {
    const { data: oddsRaw } = await supabase
      .from("odds")
      .select("*")
      .in("match_id", allIds)
      .eq("bet_type", "match_winner")
      .eq("is_active", true);

    for (const odd of (oddsRaw ?? []) as unknown as Odd[]) {
      oddsMap[odd.match_id] = odd;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-3 sm:text-5xl">
          <span className="text-[var(--accent-cyan)]">Pariez</span> sur{" "}
          <span className="text-[var(--accent-gold)]">League of Legends</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
          LEC, LCK, LPL, LCS, Worlds, MSI et toutes les ligues régionales.
          Suivez les cotes en direct et pariez sur vos équipes favorites.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/matches">
            <Button size="lg">
              <Swords className="h-4 w-4" />
              Voir les matchs
            </Button>
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
          <Link href="/matches" className="text-sm text-[var(--accent-cyan)] hover:underline">
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
            <p className="text-[var(--text-muted)]">Aucun match à venir pour le moment</p>
          </div>
        )}
      </section>
    </div>
  );
}
