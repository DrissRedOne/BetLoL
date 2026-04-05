"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useBalance(userId: string | null) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Use unique channel name to avoid collision on re-renders
    const channelName = `balance-${userId}-${Date.now()}`;
    channelRef.current = channelName;

    supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setBalance(data.balance);
        setLoading(false);
      });

    const channel = supabase
      .channel(channelName)
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
