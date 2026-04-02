import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default function MesBetsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">
        Mes paris
      </h1>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Paris en cours</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">
            0
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total gagné</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
            0,00 €
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total misé (perdu)</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-red)]">
            0,00 €
          </p>
        </Card>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <ClipboardList className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <p className="text-[var(--text-muted)]">
          Connectez-vous pour voir vos paris
        </p>
      </div>

      {/* Skeleton bet cards */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Aperçu du design</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { status: "won" as const, label: "Gagné" },
            { status: "lost" as const, label: "Perdu" },
            { status: "upcoming" as const, label: "En attente" },
          ].map((item) => (
            <Card key={item.label}>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="league">LEC</Badge>
                <Badge variant={item.status}>{item.label}</Badge>
              </div>
              <p className="text-sm font-medium truncate">Équipe A vs Équipe B</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Sélection</p>
                  <p className="font-medium">Équipe A</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Cote</p>
                  <p className="font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">
                    1.85
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Mise</p>
                  <p className="font-[family-name:var(--font-mono)]">10,00 €</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Gain</p>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-green)]">
                    18,50 €
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
