"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useBalance(userId: string | null) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchBalance() {
      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId!)
        .single();

      if (!error && data) {
        setBalance(data.balance);
      }
      setLoading(false);
    }

    fetchBalance();

    const channel = supabase
      .channel(`balance-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = (payload.new as { balance: number }).balance;
          setBalance(newBalance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { balance, loading };
}
