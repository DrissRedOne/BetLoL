import type { LolMatch, Odd } from "@/types";
import { MatchCard } from "@/components/match/match-card";
import { Search } from "lucide-react";

interface MatchListProps {
  matches: LolMatch[];
  oddsMap?: Record<string, Odd>;
  emptyMessage?: string;
}

function MatchList({ matches, oddsMap, emptyMessage = "Aucun match trouvé" }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <p className="text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          odds={oddsMap?.[match.id]}
        />
      ))}
    </div>
  );
}

export { MatchList };
