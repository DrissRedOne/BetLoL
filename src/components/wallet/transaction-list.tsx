import type { Transaction } from "@/types";
import { Card } from "@/components/ui/card";
import { formatAmount, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
}

const typeLabels: Record<Transaction["type"], string> = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  bet_placed: "Pari placé",
  bet_won: "Pari gagné",
  bet_refund: "Remboursement",
};

const typeColors: Record<Transaction["type"], string> = {
  deposit: "text-[#00FF87]",
  withdrawal: "text-[#FF4655]",
  bet_placed: "text-[#FF4655]",
  bet_won: "text-[#00FF87]",
  bet_refund: "text-[#00D4FF]",
};

const typeSign: Record<Transaction["type"], string> = {
  deposit: "+",
  withdrawal: "-",
  bet_placed: "-",
  bet_won: "+",
  bet_refund: "+",
};

function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[#64748B]">Aucune transaction</p>
      </div>
    );
  }

  return (
    <Card>
      <div className="divide-y divide-white/[0.06]">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-[#E2E8F0]">
                {typeLabels[tx.type]}
              </p>
              {tx.description && (
                <p className="text-xs text-[#64748B] mt-0.5">{tx.description}</p>
              )}
              <p className="text-xs text-[#64748B] mt-0.5">{formatDate(tx.created_at)}</p>
            </div>
            <div className="text-right">
              <p className={cn("font-mono font-semibold text-sm", typeColors[tx.type])}>
                {typeSign[tx.type]}{formatAmount(tx.amount)}
              </p>
              <p className="text-xs text-[#64748B] font-mono">
                {formatAmount(tx.balance_after)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { TransactionList };
