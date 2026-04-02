import { createClient } from "@/lib/supabase/server";
import type { LolMatch, Odd } from "@/types";
import { MatchesClient } from "./matches-client";

function sortMatches(matches: LolMatch[]): LolMatch[] {
  const statusOrder: Record<string, number> = {
    live: 0,
    upcoming: 1,
    finished: 2,
    cancelled: 3,
  };

  return [...matches].sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 99;
    const orderB = statusOrder[b.status] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
  });
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: matchesRaw } = await supabase
    .from("lol_matches")
    .select("*")
    .order("starts_at", { ascending: true });

  const matches = sortMatches((matchesRaw ?? []) as unknown as LolMatch[]);

  const matchIds = matches.map((m) => m.id);
  let oddsMap: Record<string, Odd> = {};

  if (matchIds.length > 0) {
    const { data: oddsRaw } = await supabase
      .from("odds")
      .select("*")
      .in("match_id", matchIds)
      .eq("bet_type", "match_winner")
      .eq("is_active", true);

    for (const odd of (oddsRaw ?? []) as unknown as Odd[]) {
      oddsMap[odd.match_id] = odd;
    }
  }

  return <MatchesClient matches={matches} oddsMap={oddsMap} />;
}
