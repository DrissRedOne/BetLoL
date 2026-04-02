import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";

interface BalanceDisplayProps {
  balance: number;
  pendingBets?: number;
}

function BalanceDisplay({ balance, pendingBets = 0 }: BalanceDisplayProps) {
  return (
    <Card glow>
      <div className="text-center">
        <p className="text-sm text-[#64748B] mb-1">Votre solde</p>
        <p className="text-3xl font-bold font-mono text-[#00FF87]">
          {formatAmount(balance)}
        </p>
        {pendingBets > 0 && (
          <p className="text-xs text-[#C89B3C] mt-2">
            {pendingBets} pari{pendingBets > 1 ? "s" : ""} en cours
          </p>
        )}
      </div>
    </Card>
  );
}

export { BalanceDisplay };
