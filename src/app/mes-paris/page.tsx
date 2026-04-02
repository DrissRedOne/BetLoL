import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { BetWithDetails } from "@/types";
import { formatAmount } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MesBetsClient } from "./mes-bets-client";

export default async function MesBetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/mes-paris");

  const { data: betsRaw } = await supabase
    .from("bets")
    .select("*, lol_matches(*), odds(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bets = (betsRaw ?? []) as unknown as BetWithDetails[];

  const pendingBets = bets.filter((b) => b.status === "pending");
  const settledBets = bets.filter((b) => b.status !== "pending");

  const totalWon = bets
    .filter((b) => b.status === "won")
    .reduce((sum, b) => sum + b.potential_gain, 0);
  const totalLost = bets
    .filter((b) => b.status === "lost")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">
        Mes paris
      </h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Paris en cours</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">
            {pendingBets.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total gagné</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
            {formatAmount(totalWon)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total perdu</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-red)]">
            {formatAmount(totalLost)}
          </p>
        </Card>
      </div>

      <MesBetsClient
        pendingBets={pendingBets}
        settledBets={settledBets}
      />
    </div>
  );
}
