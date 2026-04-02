import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Shield, BarChart3, Trophy, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[var(--accent-gold)]" />
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Administration
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/matchs"
            className="rounded-lg bg-[var(--accent-cyan)]/10 px-3 py-1.5 text-sm text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/20 transition-colors"
          >
            Gérer les matchs
          </Link>
          <Link
            href="/admin/resultats"
            className="rounded-lg bg-[var(--accent-gold)]/10 px-3 py-1.5 text-sm text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20 transition-colors"
          >
            Résultats
          </Link>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-[var(--accent-cyan)]" />
            <p className="text-xs text-[var(--text-muted)]">Utilisateurs</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">
            0
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-[var(--accent-gold)]" />
            <p className="text-xs text-[var(--text-muted)]">Total paris</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">
            0
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Volume récent</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
            0,00 €
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-[var(--accent-red)]" />
            <p className="text-xs text-[var(--text-muted)]">Matchs</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)]">
            <span className="text-[var(--accent-red)]">0</span>
            <span className="text-[var(--text-muted)] text-sm"> live</span>
          </p>
        </Card>
      </div>

      {/* Charts placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold mb-4">Volume quotidien (€)</h3>
          <div className="h-[250px] rounded-lg bg-white/[0.02] border border-[var(--border-subtle)] flex items-center justify-center">
            <span className="text-sm text-[var(--text-muted)]">Graphique Recharts (placeholder)</span>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-4">Répartition des paris</h3>
          <div className="h-[250px] rounded-lg bg-white/[0.02] border border-[var(--border-subtle)] flex items-center justify-center">
            <span className="text-sm text-[var(--text-muted)]">Graphique Recharts (placeholder)</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
