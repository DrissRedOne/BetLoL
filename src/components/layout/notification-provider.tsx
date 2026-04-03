"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/components/ui/toast";
import type { ReactNode } from "react";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { toast } = useToast();
  const subscribedRef = useRef(false);

  // Listen to bet status changes
  useEffect(() => {
    if (!user || subscribedRef.current) return;
    subscribedRef.current = true;

    const supabase = createClient();

    const betChannel = supabase
      .channel(`bet-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bets",
          filter: `user_id=eq.${user.id}`,
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

          // Fetch match info for the toast message
          const { data: match } = await supabase
            .from("lol_matches")
            .select("team_a_name, team_b_name")
            .eq("id", newBet.match_id)
            .single();

          const matchLabel = match
            ? `${match.team_a_name} vs ${match.team_b_name}`
            : "Match";

          if (newBet.status === "won") {
            toast(
              `Pari gagné ! ${matchLabel} — +${newBet.potential_gain.toFixed(2)}€`,
              "success"
            );
          } else if (newBet.status === "lost") {
            toast(
              `Pari perdu. ${matchLabel} — -${newBet.amount.toFixed(2)}€`,
              "error"
            );
          } else if (newBet.status === "refunded") {
            toast(
              `Pari remboursé. ${matchLabel} — +${newBet.amount.toFixed(2)}€`,
              "info"
            );
          }
        }
      )
      .subscribe();

    // Listen to match status changes (live start)
    const matchChannel = supabase
      .channel(`match-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lol_matches",
        },
        async (payload) => {
          const oldStatus = (payload.old as { status?: string })?.status;
          const newMatch = payload.new as {
            id: string;
            status: string;
            team_a_name: string;
            team_b_name: string;
          };

          // Match just went live
          if (oldStatus === "upcoming" && newMatch.status === "live") {
            // Check if user has a bet on this match
            const { data: userBets } = await supabase
              .from("bets")
              .select("id")
              .eq("user_id", user.id)
              .eq("match_id", newMatch.id)
              .eq("status", "pending")
              .limit(1);

            if (userBets && userBets.length > 0) {
              toast(
                `${newMatch.team_a_name} vs ${newMatch.team_b_name} vient de commencer !`,
                "info"
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscribedRef.current = false;
      supabase.removeChannel(betChannel);
      supabase.removeChannel(matchChannel);
    };
  }, [user, toast]);

  return <>{children}</>;
}
