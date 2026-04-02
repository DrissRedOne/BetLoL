import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Zap } from "lucide-react";

export default function HomePage() {
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

      {/* Live section placeholder */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="live">EN DIRECT</Badge>
          <h2 className="text-xl font-semibold">Matchs en cours</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} glass>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="league">LCK</Badge>
                <Badge variant="live">EN DIRECT</Badge>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-col items-center flex-1">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm font-medium mt-2">Équipe A</span>
                </div>
                <span className="text-sm text-[var(--text-muted)]">vs</span>
                <div className="flex flex-col items-center flex-1">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm font-medium mt-2">Équipe B</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] px-3 py-2 text-center">
                  <span className="text-xs text-[var(--text-muted)]">Éq. A</span>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-gold)]">1.85</p>
                </div>
                <div className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] px-3 py-2 text-center">
                  <span className="text-xs text-[var(--text-muted)]">Éq. B</span>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-gold)]">2.10</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming section placeholder */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Prochains matchs</h2>
          <Link href="/matches" className="text-sm text-[var(--accent-cyan)] hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="league">{["LEC", "LPL", "LCS"][i - 1]}</Badge>
                <Badge variant="upcoming">{["2h 30min", "5h 15min", "Demain"][i - 1]}</Badge>
              </div>
              <div className="h-20 rounded-lg bg-white/[0.02] border border-[var(--border-subtle)] flex items-center justify-center">
                <span className="text-sm text-[var(--text-muted)]">Placeholder match {i}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
