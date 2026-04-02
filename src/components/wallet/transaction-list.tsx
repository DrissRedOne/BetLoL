"use client";

import { useState } from "react";
import type { Transaction, TransactionType } from "@/types";
import { Card } from "@/components/ui/card";
import { formatAmount, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Ticket,
  Trophy,
  RotateCcw,
  Filter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

const typeConfig: Record<
  TransactionType,
  { label: string; icon: LucideIcon; color: string; sign: string }
> = {
  deposit: { label: "Dépôt", icon: ArrowDownCircle, color: "text-[var(--accent-green)]", sign: "+" },
  withdrawal: { label: "Retrait", icon: ArrowUpCircle, color: "text-[var(--accent-red)]", sign: "-" },
  bet_placed: { label: "Pari placé", icon: Ticket, color: "text-[var(--accent-red)]", sign: "-" },
  bet_won: { label: "Pari gagné", icon: Trophy, color: "text-[var(--accent-green)]", sign: "+" },
  bet_refund: { label: "Remboursement", icon: RotateCcw, color: "text-[var(--accent-cyan)]", sign: "+" },
};

const filterOptions: Array<{ value: TransactionType | null; label: string }> = [
  { value: null, label: "Tous" },
  { value: "deposit", label: "Dépôts" },
  { value: "withdrawal", label: "Retraits" },
  { value: "bet_placed", label: "Paris placés" },
  { value: "bet_won", label: "Paris gagnés" },
  { value: "bet_refund", label: "Remboursements" },
];

function TransactionList({ transactions }: TransactionListProps) {
  const [filter, setFilter] = useState<TransactionType | null>(null);

  const filtered = filter
    ? transactions.filter((tx) => tx.type === filter)
    : transactions;

  return (
    <div>
      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
        <Filter className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
        {filterOptions.map((opt) => (
          <button
            key={opt.value ?? "all"}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
              filter === opt.value
                ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)]"
                : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--text-muted)] py-8">Aucune transaction</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((tx) => {
              const config = typeConfig[tx.type as TransactionType];
              const Icon = config.icon;

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-white/5", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {config.label}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                        {tx.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={cn("font-[family-name:var(--font-mono)] font-semibold text-sm", config.color)}>
                      {config.sign}{formatAmount(tx.amount)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
                      {formatAmount(tx.balance_after)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export { TransactionList };
