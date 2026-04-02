import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { BetWithDetails } from "@/types";
import { BetHistory } from "@/components/bet/bet-history";
import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";

export default async function MesBetsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/auth/login");
  }

  const { data: bets } = await supabase
    .from("bets")
    .select("*, lol_matches(*), odds(*)")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  const typedBets = (bets ?? []) as BetWithDetails[];

  const pendingBets = typedBets.filter((b) => b.status === "pending");
  const settledBets = typedBets.filter((b) => b.status !== "pending");

  const totalWon = typedBets
    .filter((b) => b.status === "won")
    .reduce((sum, b) => sum + b.potential_gain, 0);
  const totalLost = typedBets
    .filter((b) => b.status === "lost")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes paris</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <p className="text-xs text-[#64748B]">Paris en cours</p>
          <p className="text-2xl font-bold font-mono text-[#00D4FF]">{pendingBets.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#64748B]">Total gagné</p>
          <p className="text-2xl font-bold font-mono text-[#00FF87]">{formatAmount(totalWon)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#64748B]">Total misé (perdu)</p>
          <p className="text-2xl font-bold font-mono text-[#FF4655]">{formatAmount(totalLost)}</p>
        </Card>
      </div>

      {/* Pending bets */}
      {pendingBets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">En attente</h2>
          <BetHistory bets={pendingBets} />
        </section>
      )}

      {/* Settled bets */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Historique</h2>
        <BetHistory bets={settledBets} emptyMessage="Aucun pari résolu pour le moment" />
      </section>
    </div>
  );
}
