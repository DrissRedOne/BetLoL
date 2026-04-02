import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function PortefeuillePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">
        Portefeuille
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Balance + actions */}
        <div className="space-y-6">
          <Card glow>
            <div className="text-center">
              <Wallet className="h-8 w-8 text-[var(--accent-green)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)] mb-1">Votre solde</p>
              <p className="text-3xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
                0,00 €
              </p>
              <p className="text-xs text-[var(--accent-gold)] mt-2">0 paris en cours</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <Button className="w-full" disabled>Déposer</Button>
              <Button variant="outline" className="w-full" disabled>Retirer</Button>
            </div>
          </Card>
        </div>

        {/* Transactions skeleton */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Transactions</h2>
          <Card>
            <div className="divide-y divide-[var(--border-subtle)]">
              {[
                { type: "Dépôt", amount: "+50,00 €", color: "text-[var(--accent-green)]" },
                { type: "Pari placé", amount: "-10,00 €", color: "text-[var(--accent-red)]" },
                { type: "Pari gagné", amount: "+18,50 €", color: "text-[var(--accent-green)]" },
                { type: "Pari placé", amount: "-25,00 €", color: "text-[var(--accent-red)]" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{tx.type}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Placeholder</p>
                  </div>
                  <p className={`font-[family-name:var(--font-mono)] font-semibold text-sm ${tx.color}`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
