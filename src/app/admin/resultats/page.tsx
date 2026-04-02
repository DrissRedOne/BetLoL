import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LolMatch } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettleMatchForm } from "./settle-match-form";
import Link from "next/link";

export default async function AdminResultatsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: unsettledMatches } = await supabase
    .from("lol_matches")
    .select("*")
    .in("status", ["live", "finished"])
    .is("winner", null)
    .order("starts_at", { ascending: false });

  const typedMatches = (unsettledMatches ?? []) as LolMatch[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Déclarer les résultats</h1>
        <Link
          href="/admin"
          className="text-sm text-[#64748B] hover:text-[#E2E8F0] transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>

      <div className="space-y-4">
        {typedMatches.map((match) => (
          <Card key={match.id}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="league">{match.league}</Badge>
              <Badge variant={match.status === "live" ? "live" : "finished"}>
                {match.status === "live" ? "EN DIRECT" : "Terminé"}
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">{match.team_a_name}</span>
              <span className="text-[#64748B] text-sm">
                {match.score_a} - {match.score_b}
              </span>
              <span className="font-medium">{match.team_b_name}</span>
            </div>

            <SettleMatchForm
              matchId={match.id}
              teamAName={match.team_a_name}
              teamBName={match.team_b_name}
            />
          </Card>
        ))}

        {typedMatches.length === 0 && (
          <Card>
            <p className="text-center text-[#64748B] py-8">
              Aucun match en attente de résultat
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
