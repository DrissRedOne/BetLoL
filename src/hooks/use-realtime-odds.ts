"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Odd } from "@/types";

interface UseRealtimeOddsReturn {
  odds: Odd[];
  loading: boolean;
  flashMap: Record<string, "up" | "down">;
}

export function useRealtimeOdds(matchId: string): UseRealtimeOddsReturn {
  const [odds, setOdds] = useState<Odd[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});
  const prevOddsRef = useRef<Map<string, Odd>>(new Map());

  const triggerFlash = useCallback((oddId: string, side: "a" | "b", direction: "up" | "down") => {
    const key = `${oddId}-${side}`;
    setFlashMap((prev) => ({ ...prev, [key]: direction }));
    setTimeout(() => {
      setFlashMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 600);
  }, []);

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
        const typedOdds = data as unknown as Odd[];
        setOdds(typedOdds);
        const map = new Map<string, Odd>();
        for (const odd of typedOdds) {
          map.set(odd.id, odd);
        }
        prevOddsRef.current = map;
      }
      setLoading(false);
    }

    fetchOdds();

    const channel = supabase
      .channel(`odds-${matchId}-${Date.now()}`)
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
            const newOdd = payload.new as unknown as Odd;
            setOdds((prev) => [...prev, newOdd]);
            prevOddsRef.current.set(newOdd.id, newOdd);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as unknown as Odd;
            const prev = prevOddsRef.current.get(updated.id);

            if (prev) {
              // Flash animation: green if odd drops (better for bettor), red if rises
              if (updated.odd_a !== prev.odd_a) {
                triggerFlash(updated.id, "a", updated.odd_a < prev.odd_a ? "up" : "down");
              }
              if (updated.odd_b !== prev.odd_b) {
                triggerFlash(updated.id, "b", updated.odd_b < prev.odd_b ? "up" : "down");
              }
            }

            prevOddsRef.current.set(updated.id, updated);
            setOdds((prevOdds) =>
              prevOdds.map((o) => (o.id === updated.id ? updated : o))
            );
          } else if (payload.eventType === "DELETE") {
            const oldOdd = payload.old as unknown as Odd;
            prevOddsRef.current.delete(oldOdd.id);
            setOdds((prevOdds) => prevOdds.filter((o) => o.id !== oldOdd.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, triggerFlash]);

  return { odds, loading, flashMap };
}
