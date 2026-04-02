"use client";

import { useState } from "react";
import type { LolMatch, Odd, BetSelection } from "@/types";
import { Card } from "@/components/ui/card";
import { OddsDisplay } from "@/components/match/odds-display";
import { BetSlip } from "@/components/bet/bet-slip";
import { useRealtimeOdds } from "@/hooks/use-realtime-odds";
import { BET_TYPES } from "@/lib/constants";

interface MatchOddsClientProps {
  match: LolMatch;
  initialOdds: Odd[];
  canBet: boolean;
}

interface SelectedBet {
  oddId: string;
  selection: BetSelection;
}

function MatchOddsClient({ match, initialOdds, canBet }: MatchOddsClientProps) {
  const { odds: realtimeOdds, flashMap } = useRealtimeOdds(match.id);
  const odds = realtimeOdds.length > 0 ? realtimeOdds : initialOdds;

  const [selectedBet, setSelectedBet] = useState<SelectedBet | null>(null);

  function handleOddSelect(oddId: string, selection: BetSelection) {
    if (!canBet) return;
    if (selectedBet?.oddId === oddId && selectedBet?.selection === selection) {
      setSelectedBet(null);
    } else {
      setSelectedBet({ oddId, selection });
    }
  }

  const selectedOdd = selectedBet
    ? odds.find((o) => o.id === selectedBet.oddId)
    : null;

  // Group odds by bet_type
  const grouped = new Map<string, Odd[]>();
  for (const odd of odds) {
    const key = odd.map_number
      ? `${odd.bet_type}-${odd.map_number}`
      : odd.bet_type;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(odd);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Odds list */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-semibold">Cotes disponibles</h2>

        {odds.length === 0 ? (
          <Card>
            <p className="text-center text-[var(--text-muted)] py-6">
              Aucune cote disponible pour ce match
            </p>
          </Card>
        ) : (
          Array.from(grouped.entries()).map(([key, groupOdds]) => {
            const firstOdd = groupOdds[0];
            const betTypeLabel =
              BET_TYPES[firstOdd.bet_type as keyof typeof BET_TYPES] ?? firstOdd.bet_type;
            const mapLabel = firstOdd.map_number
              ? ` — Map ${firstOdd.map_number}`
              : "";

            return (
              <Card key={key}>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                  {betTypeLabel}{mapLabel}
                </p>
                <div className="space-y-2">
                  {groupOdds.map((odd) => (
                    <OddsDisplay
                      key={odd.id}
                      odd={odd}
                      selectedSelection={
                        selectedBet?.oddId === odd.id
                          ? selectedBet.selection
                          : null
                      }
                      onSelect={canBet ? handleOddSelect : undefined}
                      flashMap={flashMap}
                    />
                  ))}
                </div>
              </Card>
            );
          })
        )}

        {!canBet && odds.length > 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center">
            Les paris sont fermés pour ce match
          </p>
        )}
      </div>

      {/* Bet slip (desktop: sidebar, mobile: bottom sheet) */}
      <div>
        {selectedOdd && selectedBet && (
          <BetSlip
            match={match}
            odd={selectedOdd}
            selection={selectedBet.selection}
            onClose={() => setSelectedBet(null)}
          />
        )}

        {!selectedBet && canBet && odds.length > 0 && (
          <Card className="hidden lg:block sticky top-20">
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)]">
                Cliquez sur une cote pour ouvrir le ticket de pari
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export { MatchOddsClient };
