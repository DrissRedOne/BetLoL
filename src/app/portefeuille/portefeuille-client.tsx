"use client";

import { useState } from "react";
import type { Transaction } from "@/types";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { TransactionList } from "@/components/wallet/transaction-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useBalance } from "@/hooks/use-balance";
import { simulateDeposit, simulateWithdrawal } from "@/lib/actions/wallet";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface PortefeuilleClientProps {
  userId: string;
  initialBalance: number;
  initialTransactions: Transaction[];
  pendingBets: number;
}

function PortefeuilleClient({
  userId,
  initialBalance,
  initialTransactions,
  pendingBets,
}: PortefeuilleClientProps) {
  const { balance } = useBalance(userId);
  const liveBalance = balance || initialBalance;

  const [transactions, setTransactions] = useState(initialTransactions);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  function addTransaction(tx: Transaction) {
    setTransactions((prev) => [tx, ...prev]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">
        Portefeuille
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <BalanceDisplay balance={liveBalance} pendingBets={pendingBets} />

          <Card>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => setDepositOpen(true)}
              >
                <ArrowDownCircle className="h-4 w-4" />
                Déposer
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setWithdrawOpen(true)}
              >
                <ArrowUpCircle className="h-4 w-4" />
                Retirer
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Transactions</h2>
          <TransactionList transactions={transactions} />
        </div>
      </div>

      {/* Deposit modal */}
      <WalletModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        title="Déposer des fonds"
        actionLabel="Confirmer le dépôt"
        minAmount={5}
        maxAmount={10000}
        quickAmounts={[10, 25, 50, 100, 250]}
        onConfirm={async (amount) => {
          const result = await simulateDeposit(amount);
          if (!result.success) throw new Error(result.error);
          return result.newBalance ?? 0;
        }}
        onSuccess={(amount, newBalance) => {
          addTransaction({
            id: crypto.randomUUID(),
            user_id: userId,
            type: "deposit",
            amount,
            balance_after: newBalance,
            reference: null,
            description: `Dépôt de ${amount.toFixed(2)}€ (simulation)`,
            created_at: new Date().toISOString(),
          });
        }}
        successMessage="Dépôt effectué avec succès !"
      />

      {/* Withdraw modal */}
      <WalletModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        title="Retirer des fonds"
        actionLabel="Confirmer le retrait"
        minAmount={10}
        maxAmount={Math.min(10000, liveBalance)}
        quickAmounts={[10, 25, 50, 100]}
        onConfirm={async (amount) => {
          const result = await simulateWithdrawal(amount);
          if (!result.success) throw new Error(result.error);
          return result.newBalance ?? 0;
        }}
        onSuccess={(amount, newBalance) => {
          addTransaction({
            id: crypto.randomUUID(),
            user_id: userId,
            type: "withdrawal",
            amount,
            balance_after: newBalance,
            reference: null,
            description: `Retrait de ${amount.toFixed(2)}€ (simulation)`,
            created_at: new Date().toISOString(),
          });
        }}
        successMessage="Retrait effectué avec succès !"
      />
    </div>
  );
}

// TODO: intégrer Stripe Checkout pour la production
// Ce modal simule un dépôt/retrait en insérant directement en DB.
function WalletModal({
  open,
  onClose,
  title,
  actionLabel,
  minAmount,
  maxAmount,
  quickAmounts,
  onConfirm,
  onSuccess,
  successMessage,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  actionLabel: string;
  minAmount: number;
  maxAmount: number;
  quickAmounts: number[];
  onConfirm: (amount: number) => Promise<number>;
  onSuccess: (amount: number, newBalance: number) => void;
  successMessage: string;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < minAmount) {
      setError(`Montant minimum : ${minAmount}€`);
      return;
    }
    if (numericAmount > maxAmount) {
      setError(`Montant maximum : ${maxAmount}€`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newBalance = await onConfirm(numericAmount);
      toast(successMessage, "success");
      onSuccess(numericAmount, newBalance);
      setAmount("");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="wallet-amount"
          label="Montant (€)"
          type="number"
          min={minAmount}
          max={maxAmount}
          step="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          placeholder={`${minAmount}€ — ${maxAmount}€`}
          error={error ?? undefined}
        />

        <div className="flex gap-1.5 flex-wrap">
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
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={loading}
          >
            {actionLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export { PortefeuilleClient };
