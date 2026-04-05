"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/components/ui/toast";
import type { ReactNode } from "react";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const betChannel = supabase
      .channel(`bet-notif-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bets",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const oldStatus = (payload.old as { status?: string })?.status;
          const newBet = payload.new as {
            status: string;
            amount: number;
            potential_gain: number;
            match_id: string;
          };

          if (oldStatus !== "pending") return;

          const { data: match } = await supabase
            .from("lol_matches")
            .select("team_a_name, team_b_name")
            .eq("id", newBet.match_id)
            .single();

          const label = match
            ? `${match.team_a_name} vs ${match.team_b_name}`
            : "Match";

          if (newBet.status === "won") {
            toastRef.current(
              `Pari gagné ! ${label} — +${newBet.potential_gain.toFixed(2)}€`,
              "success",
              6000
            );
          } else if (newBet.status === "lost") {
            toastRef.current(
              `Pari perdu. ${label} — -${newBet.amount.toFixed(2)}€`,
              "error",
              6000
            );
          } else if (newBet.status === "refunded") {
            toastRef.current(
              `Pari remboursé. ${label} — +${newBet.amount.toFixed(2)}€`,
              "info",
              6000
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(betChannel);
    };
  }, [userId]);

  return <>{children}</>;
}
