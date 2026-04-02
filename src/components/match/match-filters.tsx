"use client";

import { cn } from "@/lib/utils";
import { LOL_LEAGUES } from "@/lib/constants";
import type { MatchStatus } from "@/types";

interface MatchFiltersProps {
  selectedLeague: string | null;
  selectedStatus: MatchStatus | null;
  onLeagueChange: (league: string | null) => void;
  onStatusChange: (status: MatchStatus | null) => void;
}

const statusFilters: Array<{ value: MatchStatus | null; label: string }> = [
  { value: null, label: "Tous" },
  { value: "live", label: "En direct" },
  { value: "upcoming", label: "À venir" },
  { value: "finished", label: "Terminés" },
];

function MatchFilters({
  selectedLeague,
  selectedStatus,
  onLeagueChange,
  onStatusChange,
}: MatchFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusFilters.map((filter) => (
          <button
            key={filter.value ?? "all"}
            type="button"
            onClick={() => onStatusChange(filter.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer",
              selectedStatus === filter.value
                ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)]"
                : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-primary)]"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <LeagueChip
          label="Toutes"
          selected={selectedLeague === null}
          onClick={() => onLeagueChange(null)}
        />
        {LOL_LEAGUES.map((league) => (
          <LeagueChip
            key={league.id}
            label={league.name}
            selected={selectedLeague === league.id}
            onClick={() => onLeagueChange(league.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LeagueChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer border",
        selected
          ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border-[var(--accent-gold)]/40"
          : "bg-white/5 text-[var(--text-muted)] border-transparent hover:bg-white/10 hover:text-[var(--text-primary)]"
      )}
    >
      {label}
    </button>
  );
}

export { MatchFilters };
