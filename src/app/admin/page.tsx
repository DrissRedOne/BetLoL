import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";
import { AdminCharts } from "./admin-charts";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const [
    { count: totalUsers },
    { count: totalBets },
    { data: recentBets },
    { count: liveMatches },
    { count: upcomingMatches },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("bets").select("*", { count: "exact", head: true }),
    supabase
      .from("bets")
      .select("amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("lol_matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "live"),
    supabase
      .from("lol_matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "upcoming"),
  ]);

  const totalVolume = (recentBets ?? []).reduce(
    (sum, b) => sum + ((b as { amount: number }).amount ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Administration</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/matchs"
            className="rounded-lg bg-[#00D4FF]/10 px-3 py-1.5 text-sm text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
          >
            Gérer les matchs
          </Link>
          <Link
            href="/admin/resultats"
            className="rounded-lg bg-[#C89B3C]/10 px-3 py-1.5 text-sm text-[#C89B3C] hover:bg-[#C89B3C]/20 transition-colors"
          >
            Résultats
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <p className="text-xs text-[#64748B]">Utilisateurs</p>
          <p className="text-2xl font-bold font-mono text-[#00D4FF]">{totalUsers ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#64748B]">Total paris</p>
          <p className="text-2xl font-bold font-mono text-[#C89B3C]">{totalBets ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#64748B]">Volume récent</p>
          <p className="text-2xl font-bold font-mono text-[#00FF87]">{formatAmount(totalVolume)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#64748B]">Matchs</p>
          <p className="text-2xl font-bold font-mono">
            <span className="text-[#FF4655]">{liveMatches ?? 0}</span>
            <span className="text-[#64748B] text-sm"> live</span>
            {" / "}
            <span className="text-[#00D4FF]">{upcomingMatches ?? 0}</span>
            <span className="text-[#64748B] text-sm"> à venir</span>
          </p>
        </Card>
      </div>

      {/* Charts */}
      <AdminCharts bets={recentBets as Array<{ amount: number; status: string; created_at: string }> ?? []} />
    </div>
  );
}
