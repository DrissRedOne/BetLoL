"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LolMatch, MatchStatus } from "@/types";

interface UseMatchesOptions {
  league?: string | null;
  status?: MatchStatus | null;
}

export function useMatches(options: UseMatchesOptions = {}) {
  const [matches, setMatches] = useState<LolMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("lol_matches")
      .select("*")
      .order("starts_at", { ascending: true });

    if (options.league) {
      query = query.ilike("league", options.league);
    }
    if (options.status) {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query;

    if (!error && data) {
      setMatches(data as LolMatch[]);
    }
    setLoading(false);
  }, [options.league, options.status]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, refetch: fetchMatches };
}
