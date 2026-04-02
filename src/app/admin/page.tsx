import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";
import { Shield, Ticket, TrendingUp, Users, Swords } from "lucide-react";
import { AdminCharts } from "./admin-charts";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { data: todayBets },
    { count: activeUsers },
    { count: liveMatches },
    { data: last30DaysBets },
  ] = await Promise.all([
    supabase
      .from("bets")
      .select("amount, created_at")
      .gte("created_at", today.toISOString()),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("lol_matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "live"),
    supabase
      .from("bets")
      .select("amount, created_at, match_id, lol_matches(league)")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const todayCount = todayBets?.length ?? 0;
  const todayVolume = (todayBets ?? []).reduce(
    (sum, b) => sum + ((b as { amount: number }).amount ?? 0),
    0
  );

  // Aggregate daily volume for bar chart
  const dailyMap = new Map<string, number>();
  const leagueMap = new Map<string, number>();

  for (const bet of (last30DaysBets ?? []) as Array<{
    amount: number;
    created_at: string;
    lol_matches: { league: string } | null;
  }>) {
    const day = new Date(bet.created_at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + bet.amount);

    const league = bet.lol_matches?.league ?? "Autre";
    leagueMap.set(league, (leagueMap.get(league) ?? 0) + bet.amount);
  }

  const dailyData = Array.from(dailyMap.entries()).map(([date, volume]) => ({
    date,
    volume: Math.round(volume * 100) / 100,
  }));

  const leagueData = Array.from(leagueMap.entries()).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: Math.round(value * 100) / 100,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[var(--accent-gold)]" />
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Administration
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/matchs"
            className="rounded-lg bg-[var(--accent-cyan)]/10 px-3 py-1.5 text-sm text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/20 transition-colors"
          >
            Gérer les matchs
          </Link>
          <Link
            href="/admin/resultats"
            className="rounded-lg bg-[var(--accent-gold)]/10 px-3 py-1.5 text-sm text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20 transition-colors"
          >
            Résultats
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-4 w-4 text-[var(--accent-cyan)]" />
            <p className="text-xs text-[var(--text-muted)]">Paris aujourd&apos;hui</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">
            {todayCount}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-[var(--accent-green)]" />
            <p className="text-xs text-[var(--text-muted)]">Volume aujourd&apos;hui</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
            {formatAmount(todayVolume)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-[var(--accent-gold)]" />
            <p className="text-xs text-[var(--text-muted)]">Utilisateurs</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">
            {activeUsers ?? 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Swords className="h-4 w-4 text-[var(--accent-red)]" />
            <p className="text-xs text-[var(--text-muted)]">Matchs en direct</p>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-red)]">
            {liveMatches ?? 0}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <AdminCharts dailyData={dailyData} leagueData={leagueData} />
    </div>
  );
}
