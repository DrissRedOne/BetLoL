import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Transaction } from "@/types";
import { PortefeuilleClient } from "./portefeuille-client";

export default async function PortefeuillePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/portefeuille");

  const [{ data: profile }, { data: txRaw }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending"),
  ]);

  const initialBalance = profile?.balance ?? 0;
  const transactions = (txRaw ?? []) as unknown as Transaction[];
  const pendingBets = pendingCount ?? 0;

  return (
    <PortefeuilleClient
      userId={user.id}
      initialBalance={initialBalance}
      initialTransactions={transactions}
      pendingBets={pendingBets}
    />
  );
}
