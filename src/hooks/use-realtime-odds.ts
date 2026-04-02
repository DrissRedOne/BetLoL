"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Odd } from "@/types";

export function useRealtimeOdds(matchId: string) {
  const [odds, setOdds] = useState<Odd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchOdds() {
      const { data, error } = await supabase
        .from("odds")
        .select("*")
        .eq("match_id", matchId)
        .eq("is_active", true)
        .order("bet_type");

      if (!error && data) {
        setOdds(data as Odd[]);
      }
      setLoading(false);
    }

    fetchOdds();

    const channel = supabase
      .channel(`odds-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "odds",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOdds((prev) => [...prev, payload.new as Odd]);
          } else if (payload.eventType === "UPDATE") {
            setOdds((prev) =>
              prev.map((o) => (o.id === (payload.new as Odd).id ? (payload.new as Odd) : o))
            );
          } else if (payload.eventType === "DELETE") {
            setOdds((prev) => prev.filter((o) => o.id !== (payload.old as Odd).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return { odds, loading };
}
