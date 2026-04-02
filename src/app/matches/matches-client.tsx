"use client";

import { useState, useMemo } from "react";
import type { LolMatch, Odd, MatchStatus } from "@/types";
import { MatchFilters } from "@/components/match/match-filters";
import { MatchList } from "@/components/match/match-list";

interface MatchesClientProps {
  matches: LolMatch[];
  oddsMap: Record<string, Odd>;
}

function MatchesClient({ matches, oddsMap }: MatchesClientProps) {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | null>(null);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (selectedLeague && m.league.toLowerCase() !== selectedLeague.toLowerCase()) {
        return false;
      }
      if (selectedStatus && m.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [matches, selectedLeague, selectedStatus]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">
        Tous les matchs
      </h1>

      <div className="mb-6">
        <MatchFilters
          selectedLeague={selectedLeague}
          selectedStatus={selectedStatus}
          onLeagueChange={setSelectedLeague}
          onStatusChange={setSelectedStatus}
        />
      </div>

      <MatchList
        matches={filtered}
        oddsMap={oddsMap}
        emptyMessage="Aucun match ne correspond à vos filtres"
      />
    </div>
  );
}

export { MatchesClient };
