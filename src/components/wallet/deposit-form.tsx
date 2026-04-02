"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface DepositFormProps {
  onDeposit: (amount: number) => Promise<void>;
}

function DepositForm({ onDeposit }: DepositFormProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [10, 25, 50, 100, 250];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < 5) {
      setError("Le dépôt minimum est de 5€");
      return;
    }
    if (numericAmount > 10000) {
      setError("Le dépôt maximum est de 10 000€");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onDeposit(numericAmount);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du dépôt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[#E2E8F0] mb-4">Déposer des fonds</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="deposit-amount"
          type="number"
          min={5}
          max={10000}
          step="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          placeholder="Montant en €"
          error={error ?? undefined}
        />

        <div className="flex gap-1.5 flex-wrap">
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
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Déposer
        </Button>
      </form>
    </Card>
  );
}

export { DepositForm };
