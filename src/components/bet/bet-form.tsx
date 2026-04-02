"use client";

import { useState } from "react";
import type { Odd } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OddsDisplay } from "@/components/match/odds-display";
import { formatAmount, formatOdd, calculatePotentialGain } from "@/lib/utils";
import { BET_LIMITS } from "@/lib/constants";

interface BetFormProps {
  odd: Odd;
  balance: number;
  onSubmit: (oddId: string, selection: "a" | "b", amount: number) => Promise<void>;
}

function BetForm({ odd, balance, onSubmit }: BetFormProps) {
  const [selection, setSelection] = useState<"a" | "b" | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const selectedOdd = selection === "a" ? odd.odd_a : selection === "b" ? odd.odd_b : 0;
  const potentialGain = calculatePotentialGain(numericAmount, selectedOdd);

  const quickAmounts = [5, 10, 25, 50, 100];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selection) {
      setError("Sélectionnez une option");
      return;
    }
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
    try {
      await onSubmit(odd.id, selection, numericAmount);
      setSelection(null);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du placement du pari");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-[#64748B] mb-2">Sélectionnez votre choix</p>
        <OddsDisplay
          odd={odd}
          selectedSelection={selection}
          onSelect={(_oddId, sel) => setSelection(sel)}
        />
      </div>

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
          placeholder={`${BET_LIMITS.min}€ - ${BET_LIMITS.max}€`}
          error={error ?? undefined}
        />

        <div className="mt-2 flex gap-1.5 flex-wrap">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              type="button"
              onClick={() => setAmount(String(qa))}
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-[#64748B] hover:bg-white/10 hover:text-[#E2E8F0] transition-colors cursor-pointer"
            >
              {qa}€
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(Math.min(balance, BET_LIMITS.max)))}
            className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-[#C89B3C] hover:bg-[#C89B3C]/10 transition-colors cursor-pointer"
          >
            MAX
          </button>
        </div>
      </div>

      {selection && numericAmount > 0 && (
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Cote</span>
            <span className="font-mono text-[#C89B3C]">{formatOdd(selectedOdd)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Mise</span>
            <span className="font-mono">{formatAmount(numericAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-white/[0.06] pt-1.5">
            <span className="text-[#64748B]">Gain potentiel</span>
            <span className="font-mono text-[#00FF87]">{formatAmount(potentialGain)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <span>Solde : {formatAmount(balance)}</span>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
        disabled={!selection || numericAmount <= 0}
      >
        Placer le pari
      </Button>
    </form>
  );
}

export { BetForm };
