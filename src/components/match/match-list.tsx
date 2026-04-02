import type { LolMatch, Odd } from "@/types";
import { MatchCard } from "@/components/match/match-card";

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
          <svg className="h-8 w-8 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <p className="text-[#64748B]">{emptyMessage}</p>
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
