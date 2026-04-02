import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Transaction } from "@/types";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { TransactionList } from "@/components/wallet/transaction-list";
import { WalletActions } from "./wallet-actions";

export default async function PortefeuillePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { data: transactions }, { data: pendingBets }] = await Promise.all([
    supabase
      .from("profiles")
      .select("balance")
      .eq("id", userData.user.id)
      .single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("bets")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("status", "pending"),
  ]);

  const balance = profile?.balance ?? 0;
  const typedTransactions = (transactions ?? []) as Transaction[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Portefeuille</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <BalanceDisplay balance={balance} pendingBets={pendingBets?.length ?? 0} />
          <WalletActions />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Transactions</h2>
          <TransactionList transactions={typedTransactions} />
        </div>
      </div>
    </div>
  );
}
