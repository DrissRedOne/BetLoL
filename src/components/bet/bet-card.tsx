import type { BetWithDetails } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatOdd, formatDate } from "@/lib/utils";

interface BetCardProps {
  bet: BetWithDetails;
}

function BetCard({ bet }: BetCardProps) {
  const match = bet.lol_matches;
  const odd = bet.odds;

  const statusBadge = {
    pending: { variant: "upcoming" as const, label: "En attente" },
    won: { variant: "won" as const, label: "Gagné" },
    lost: { variant: "lost" as const, label: "Perdu" },
    cancelled: { variant: "cancelled" as const, label: "Annulé" },
    refunded: { variant: "default" as const, label: "Remboursé" },
  }[bet.status];

  const selectedLabel = bet.selection === "a" ? odd.label_a : odd.label_b;

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="league">{match.league}</Badge>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <p className="text-sm font-medium text-[#E2E8F0] truncate">
            {match.team_a_name} vs {match.team_b_name}
          </p>
          <p className="text-xs text-[#64748B] mt-0.5">
            {formatDate(bet.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-[#64748B]">Sélection</p>
          <p className="font-medium text-[#E2E8F0]">{selectedLabel}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Cote</p>
          <p className="font-mono text-[#C89B3C]">{formatOdd(bet.locked_odd)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Mise</p>
          <p className="font-mono">{formatAmount(bet.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">
            {bet.status === "won" ? "Gain" : "Gain potentiel"}
          </p>
          <p className={`font-mono font-semibold ${bet.status === "won" ? "text-[#00FF87]" : "text-[#E2E8F0]"}`}>
            {formatAmount(bet.potential_gain)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export { BetCard };
