"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LolMatch } from "@/types";

/**
 * Subscribes to realtime match updates (status changes, score changes).
 * Calls onUpdate when any match in the provided list changes.
 */
export function useMatchUpdates(
  matchIds: string[],
  onUpdate: (matchId: string, changes: Partial<LolMatch>) => void
) {
  useEffect(() => {
    if (matchIds.length === 0) return;

    const supabase = createClient();

    const channel = supabase
      .channel("match-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lol_matches",
        },
        (payload) => {
          const updated = payload.new as { id: string } & Partial<LolMatch>;
          if (matchIds.includes(updated.id)) {
            onUpdate(updated.id, updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchIds, onUpdate]);
}
