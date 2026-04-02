import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords } from "lucide-react";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Match header */}
      <Card className="mb-6" glass>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="league">LCK</Badge>
          <span className="text-xs text-[var(--text-muted)]">Spring Split 2025</span>
          <Badge variant="upcoming">2h 30min</Badge>
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col items-center flex-1">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Swords className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <span className="text-lg font-semibold">Équipe A</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl text-[var(--text-muted)]">VS</span>
            <span className="text-xs text-[var(--text-muted)]">BO3</span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Swords className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <span className="text-lg font-semibold">Équipe B</span>
          </div>
        </div>
      </Card>

      {/* Odds + bet form */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Cotes disponibles</h2>

          {["Vainqueur du match", "Premier sang", "Première tour"].map((label) => (
            <Card key={label}>
              <span className="text-sm font-medium text-[var(--text-primary)] mb-3 block">
                {label}
              </span>
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Équipe A</p>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-gold)]">
                    1.85
                  </p>
                </div>
                <div className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Équipe B</p>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-gold)]">
                    2.10
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bet slip skeleton */}
        <div>
          <Card className="sticky top-20">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              Placer un pari
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Match {id} — Équipe A vs Équipe B
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-3 py-2 text-center cursor-pointer"
                >
                  <span className="text-xs text-[var(--accent-cyan)]">Éq. A</span>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-cyan)]">
                    1.85
                  </p>
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] px-3 py-2 text-center cursor-pointer hover:border-[var(--accent-cyan)]/30"
                >
                  <span className="text-xs text-[var(--text-muted)]">Éq. B</span>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-gold)]">
                    2.10
                  </p>
                </button>
              </div>

              <Input
                id="bet-amount"
                label="Montant de la mise (€)"
                type="number"
                placeholder="1€ - 500€"
                disabled
              />

              <div className="flex gap-1.5">
                {[5, 10, 25, 50, 100].map((amount) => (
                  <span
                    key={amount}
                    className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-[var(--text-muted)]"
                  >
                    {amount}€
                  </span>
                ))}
              </div>

              <div className="rounded-lg bg-white/[0.02] border border-[var(--border-subtle)] p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Cote</span>
                  <span className="font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">
                    1.85
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Mise</span>
                  <span className="font-[family-name:var(--font-mono)]">10,00 €</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-[var(--border-subtle)] pt-1.5">
                  <span className="text-[var(--text-muted)]">Gain potentiel</span>
                  <span className="font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
                    18,50 €
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled>
                Placer le pari
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
