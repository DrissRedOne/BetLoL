"use client";

import { useState } from "react";
import type { Odd, LolMatch, BetSelection } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/use-user";
import { placeBet } from "@/lib/actions/bet";
import { formatAmount, formatOdd, calculatePotentialGain } from "@/lib/utils";
import { BET_LIMITS } from "@/lib/constants";
import { X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BetSlipProps {
  match: LolMatch;
  odd: Odd;
  selection: BetSelection;
  onClose: () => void;
}

function BetSlip({ match, odd, selection, onClose }: BetSlipProps) {
  const { user, profile, refetch } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const selectedOdd = selection === "a" ? odd.odd_a : odd.odd_b;
  const selectedLabel = selection === "a" ? odd.label_a : odd.label_b;
  const potentialGain = calculatePotentialGain(numericAmount, selectedOdd);
  const balance = profile?.balance ?? 0;

  const quickAmounts = [5, 10, 25, 50, 100];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (numericAmount < BET_LIMITS.min) {
      setError(`Mise minimum : ${BET_LIMITS.min}€`);
      return;
    }
    if (numericAmount > BET_LIMITS.max) {
      setError(`Mise maximum : ${BET_LIMITS.max}€`);
      return;
    }
    if (numericAmount > balance) {
      setError("Solde insuffisant");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await placeBet(odd.id, selection, numericAmount);

    if (result.success) {
      toast(`Pari placé ! Gain potentiel : ${formatAmount(potentialGain)}`, "success");
      await refetch();
      onClose();
    } else {
      setError(result.error ?? "Erreur lors du placement du pari");
      toast(result.error ?? "Erreur lors du placement du pari", "error");
    }

    setLoading(false);
  }

  if (!user) {
    return (
      <SlipShell onClose={onClose} match={match}>
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-muted)] mb-4">Connectez-vous pour parier</p>
          <Link href="/auth/login">
            <Button>
              <LogIn className="h-4 w-4" />
              Se connecter
            </Button>
          </Link>
        </div>
      </SlipShell>
    );
  }

  return (
    <SlipShell onClose={onClose} match={match}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selected bet summary */}
        <div className="rounded-lg border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/5 px-3 py-2">
          <p className="text-xs text-[var(--text-muted)]">Votre sélection</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium text-[var(--accent-cyan)]">{selectedLabel}</span>
            <span className="font-[family-name:var(--font-mono)] font-semibold text-[var(--accent-gold)]">
              {formatOdd(selectedOdd)}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div>
          <Input
            id="bet-amount"
            label="Montant de la mise (€)"
            type="number"
            min={BET_LIMITS.min}
            max={BET_LIMITS.max}
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            placeholder={`${BET_LIMITS.min}€ — ${BET_LIMITS.max}€`}
            error={error ?? undefined}
          />

          <div className="mt-2 flex gap-1.5 flex-wrap">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(String(qa))}
                className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {qa}€
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(String(Math.min(balance, BET_LIMITS.max)))}
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors cursor-pointer"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Potential gain */}
        {numericAmount > 0 && (
          <div className="rounded-lg bg-white/[0.02] border border-[var(--border-subtle)] p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Cote</span>
              <span className="font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">
                {formatOdd(selectedOdd)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Mise</span>
              <span className="font-[family-name:var(--font-mono)]">{formatAmount(numericAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-[var(--border-subtle)] pt-1.5">
              <span className="text-[var(--text-muted)]">Gain potentiel</span>
              <span className="font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
                {formatAmount(potentialGain)}
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-[var(--text-muted)]">
          Solde : {formatAmount(balance)}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          disabled={numericAmount <= 0}
        >
          Placer le pari
        </Button>
      </form>
    </SlipShell>
  );
}

function SlipShell({
  match,
  onClose,
  children,
}: {
  match: LolMatch;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Mobile: bottom sheet overlay */}
      <div
        className={cn("fixed inset-0 bg-black/50 z-40 lg:hidden")}
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Fermer"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      />

      {/* Desktop: sidebar card / Mobile: bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:static lg:z-auto animate-slide-up lg:animate-none">
        <div className="bg-[var(--bg-card)] border-t border-[var(--border-subtle)] rounded-t-2xl lg:rounded-xl lg:border lg:sticky lg:top-20 p-4 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Placer un pari</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {match.team_a_name} vs {match.team_b_name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer lg:hidden"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}

export { BetSlip };
