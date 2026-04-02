import Link from "next/link";
import type { BetWithDetails } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatOdd, formatDate } from "@/lib/utils";
import { BET_TYPES } from "@/lib/constants";
import { Clock, CheckCircle, XCircle, RotateCcw, Ban } from "lucide-react";

interface BetCardProps {
  bet: BetWithDetails;
}

const statusConfig = {
  pending: {
    variant: "upcoming" as const,
    label: "En attente",
    icon: Clock,
    gainColor: "text-[var(--text-primary)]",
  },
  won: {
    variant: "won" as const,
    label: "Gagné",
    icon: CheckCircle,
    gainColor: "text-[var(--accent-green)]",
  },
  lost: {
    variant: "lost" as const,
    label: "Perdu",
    icon: XCircle,
    gainColor: "text-[var(--accent-red)]",
  },
  cancelled: {
    variant: "cancelled" as const,
    label: "Annulé",
    icon: Ban,
    gainColor: "text-[var(--text-muted)]",
  },
  refunded: {
    variant: "default" as const,
    label: "Remboursé",
    icon: RotateCcw,
    gainColor: "text-[var(--text-muted)]",
  },
};

function BetCard({ bet }: BetCardProps) {
  const match = bet.lol_matches;
  const odd = bet.odds;
  const config = statusConfig[bet.status];
  const StatusIcon = config.icon;

  const selectedLabel = bet.selection === "a" ? odd.label_a : odd.label_b;
  const betTypeLabel = BET_TYPES[odd.bet_type as keyof typeof BET_TYPES] ?? odd.bet_type;
  const isLive = match.status === "live";

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:border-[var(--accent-cyan)]/20 transition-all cursor-pointer h-full">
        {/* Header: league + status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="league">{match.league}</Badge>
            {isLive && bet.status === "pending" && (
              <Badge variant="live">LIVE</Badge>
            )}
          </div>
          <Badge variant={config.variant}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Match info */}
        <div className="mb-3">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {match.team_a_name} vs {match.team_b_name}
          </p>
          {/* Live score */}
          {isLive && bet.status === "pending" && (
            <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] mt-0.5">
              Score : {match.score_a} - {match.score_b}
            </p>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {betTypeLabel} · {formatDate(bet.created_at)}
          </p>
        </div>

        {/* Bet details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Sélection</p>
            <p className="font-medium text-[var(--text-primary)] truncate">{selectedLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Cote</p>
            <p className="font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">
              {formatOdd(bet.locked_odd)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Mise</p>
            <p className="font-[family-name:var(--font-mono)]">{formatAmount(bet.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {bet.status === "won" ? "Gain" : bet.status === "refunded" ? "Remboursé" : "Gain pot."}
            </p>
            <p className={`font-[family-name:var(--font-mono)] font-semibold ${config.gainColor}`}>
              {bet.status === "refunded"
                ? formatAmount(bet.amount)
                : formatAmount(bet.potential_gain)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { BetCard };
