"use client";

import { useState } from "react";
import { useMatches } from "@/hooks/use-matches";
import { MatchList } from "@/components/match/match-list";
import { MatchFilters } from "@/components/match/match-filters";
import type { MatchStatus } from "@/types";

export default function MatchesPage() {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | null>(null);

  const { matches, loading } = useMatches({
    league: selectedLeague,
    status: selectedStatus,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tous les matchs</h1>

      <div className="mb-6">
        <MatchFilters
          selectedLeague={selectedLeague}
          selectedStatus={selectedStatus}
          onLeagueChange={setSelectedLeague}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-[#111827] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <MatchList matches={matches} emptyMessage="Aucun match ne correspond à vos filtres" />
      )}
    </div>
  );
}
