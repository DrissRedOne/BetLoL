import type { BetWithDetails } from "@/types";
import { BetCard } from "@/components/bet/bet-card";
import { ClipboardList } from "lucide-react";

interface BetHistoryProps {
  bets: BetWithDetails[];
  emptyMessage?: string;
}

function BetHistory({ bets, emptyMessage = "Aucun pari trouvé" }: BetHistoryProps) {
  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <ClipboardList className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <p className="text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {bets.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </div>
  );
}

export { BetHistory };
