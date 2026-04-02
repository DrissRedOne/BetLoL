import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { LolMatch, Odd } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MatchCard } from "@/components/match/match-card";
import { LOL_LEAGUES } from "@/lib/constants";
import { formatOdd, getTimeUntil } from "@/lib/utils";
import {
  Swords,
  UserPlus,
  Wallet,
  Target,
  ArrowRight,
  Zap,
} from "lucide-react";

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
      .limit(6),
  ]);

  const liveMatches = (liveRaw ?? []) as unknown as LolMatch[];
  const upcomingMatches = (upcomingRaw ?? []) as unknown as LolMatch[];
  const heroMatches = upcomingMatches.slice(0, 3);

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
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent-cyan)]/5 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-[var(--accent-gold)]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="league" className="mb-4">
              <Zap className="h-3 w-3" />
              Paris esportifs LoL
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] leading-tight mb-4">
              Parie sur tes équipes{" "}
              <span className="text-[var(--accent-cyan)]">LoL</span>{" "}
              <span className="text-[var(--accent-gold)]">préférées</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
              LEC, LCK, LPL, LCS, Worlds, MSI et toutes les ligues régionales.
              Cotes en direct, paris instantanés, gains immédiats.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/matches">
                <Button size="lg" className="w-full sm:w-auto">
                  <Swords className="h-4 w-4" />
                  Commencer à parier
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Créer un compte
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero match cards */}
          {heroMatches.length > 0 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto">
              {heroMatches.map((match) => {
                const odd = oddsMap[match.id];
                return (
                  <Link
                    key={match.id}
                    href={`/match/${match.id}`}
                    className="block"
                  >
                    <Card className="hover:border-[var(--accent-cyan)]/20 transition-all cursor-pointer text-center py-3 px-3">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                        {match.league} · {getTimeUntil(match.starts_at)}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {match.team_a_name} vs {match.team_b_name}
                      </p>
                      {odd && (
                        <div className="flex gap-2 mt-2">
                          <span className="flex-1 text-xs font-[family-name:var(--font-mono)] text-[var(--accent-gold)] bg-white/[0.03] rounded px-1 py-0.5">
                            {formatOdd(odd.odd_a)}
                          </span>
                          <span className="flex-1 text-xs font-[family-name:var(--font-mono)] text-[var(--accent-gold)] bg-white/[0.03] rounded px-1 py-0.5">
                            {formatOdd(odd.odd_b)}
                          </span>
                        </div>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Live matches ─────────────────────────────────────── */}
      {liveMatches.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="live">EN DIRECT</Badge>
              <h2 className="text-xl font-semibold">Matchs en cours</h2>
            </div>
            <Link
              href="/matches"
              className="text-sm text-[var(--accent-cyan)] hover:underline flex items-center gap-1"
            >
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} odds={oddsMap[match.id]} />
            ))}
          </div>
        </section>
      )}

      {/* ── Upcoming matches ─────────────────────────────────── */}
      {upcomingMatches.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Prochains matchs</h2>
            <Link
              href="/matches"
              className="text-sm text-[var(--accent-cyan)] hover:underline flex items-center gap-1"
            >
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} odds={oddsMap[match.id]} />
            ))}
          </div>
        </section>
      )}

      {/* ── Leagues ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-semibold text-center mb-8">
          Ligues couvertes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LOL_LEAGUES.map((league) => (
            <Card
              key={league.id}
              className="text-center py-4 hover:border-[var(--accent-gold)]/30 transition-all"
            >
              <p className="text-sm font-semibold text-[var(--accent-gold)]">
                {league.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {league.region}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-xl font-semibold text-center mb-10">
          Comment ça marche
        </h2>
        <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
          <Step
            number={1}
            icon={UserPlus}
            title="Inscris-toi"
            description="Crée ton compte en 30 secondes avec email ou Google."
          />
          <Step
            number={2}
            icon={Wallet}
            title="Dépose des fonds"
            description="Ajoute de l'argent sur ton compte pour commencer à parier."
          />
          <Step
            number={3}
            icon={Target}
            title="Parie & gagne"
            description="Choisis ton match, place ton pari et suis les résultats en direct."
          />
        </div>
        <div className="text-center mt-10">
          <Link href="/auth/register">
            <Button size="lg">
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number;
  icon: typeof Swords;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-4">
        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center mx-auto">
          <Icon className="h-6 w-6 text-[var(--accent-cyan)]" />
        </div>
        <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[var(--accent-gold)] text-[var(--bg-primary)] text-xs font-bold flex items-center justify-center">
          {number}
        </span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
