"use client";

import type { Odd, LolMatch } from "@/types";
import { Card } from "@/components/ui/card";
import { BetForm } from "@/components/bet/bet-form";

interface BetSlipProps {
  match: LolMatch;
  odd: Odd;
  balance: number;
  onSubmit: (oddId: string, selection: "a" | "b", amount: number) => Promise<void>;
}

function BetSlip({ match, odd, balance, onSubmit }: BetSlipProps) {
  return (
    <Card className="sticky top-20">
      <h3 className="text-sm font-semibold text-[#E2E8F0] mb-1">Placer un pari</h3>
      <p className="text-xs text-[#64748B] mb-4">
        {match.team_a_name} vs {match.team_b_name}
      </p>
      <BetForm odd={odd} balance={balance} onSubmit={onSubmit} />
    </Card>
  );
}

export { BetSlip };
