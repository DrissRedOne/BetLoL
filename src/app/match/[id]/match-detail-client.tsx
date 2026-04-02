"use client";

import { useState } from "react";
import type { LolMatch, Odd } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BetForm } from "@/components/bet/bet-form";
import { BET_TYPES } from "@/lib/constants";
import { useRealtimeOdds } from "@/hooks/use-realtime-odds";
import { useBalance } from "@/hooks/use-balance";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface MatchDetailClientProps {
  matchId: string;
  match: LolMatch;
  odds: Odd[];
  initialBalance: number;
  isAuthenticated: boolean;
}

function MatchDetailClient({
  matchId,
  match,
  odds: initialOdds,
  initialBalance,
  isAuthenticated,
}: MatchDetailClientProps) {
  const { odds: realtimeOdds } = useRealtimeOdds(matchId);
  const currentOdds = realtimeOdds.length > 0 ? realtimeOdds : initialOdds;
  const [selectedOddId, setSelectedOddId] = useState<string | null>(
    currentOdds[0]?.id ?? null
  );
  const [success, setSuccess] = useState(false);

  const selectedOdd = currentOdds.find((o) => o.id === selectedOddId);

  async function handlePlaceBet(oddId: string, selection: "a" | "b", amount: number) {
    const supabase = createClient();
    const { error } = await supabase.rpc("place_bet", {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_odd_id: oddId,
      p_selection: selection,
      p_amount: amount,
    });

    if (error) throw new Error(error.message);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (!isAuthenticated) {
    return (
      <Card className="sticky top-20">
        <div className="text-center py-4">
          <p className="text-sm text-[#64748B] mb-3">Connectez-vous pour parier</p>
          <Link href="/auth/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="sticky top-20">
        <h3 className="text-sm font-semibold text-[#E2E8F0] mb-1">Placer un pari</h3>
        <p className="text-xs text-[#64748B] mb-3">
          {match.team_a_name} vs {match.team_b_name}
        </p>

        {currentOdds.length > 1 && (
          <div className="mb-4">
            <p className="text-xs text-[#64748B] mb-2">Type de pari</p>
            <div className="flex flex-wrap gap-1.5">
              {currentOdds.map((odd) => (
                <button
                  key={odd.id}
                  type="button"
                  onClick={() => setSelectedOddId(odd.id)}
                  className={`text-xs rounded-md px-2 py-1 transition-all cursor-pointer ${
                    selectedOddId === odd.id
                      ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30"
                      : "bg-white/5 text-[#64748B] border border-transparent hover:bg-white/10"
                  }`}
                >
                  {BET_TYPES[odd.bet_type]}
                  {odd.map_number ? ` M${odd.map_number}` : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedOdd && (
          <BetForm
            odd={selectedOdd}
            balance={initialBalance}
            onSubmit={handlePlaceBet}
          />
        )}

        {success && (
          <div className="mt-3 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/30 p-3 text-center">
            <p className="text-sm text-[#00FF87] font-medium">Pari placé avec succès !</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export { MatchDetailClient };
