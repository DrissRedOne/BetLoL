import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LolMatch } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminMatchsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: matches } = await supabase
    .from("lol_matches")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(50);

  const typedMatches = (matches ?? []) as LolMatch[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des matchs</h1>
        <Link
          href="/admin"
          className="text-sm text-[#64748B] hover:text-[#E2E8F0] transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>

      <div className="space-y-3">
        {typedMatches.map((match) => {
          const statusBadge = {
            upcoming: "upcoming" as const,
            live: "live" as const,
            finished: "finished" as const,
            cancelled: "cancelled" as const,
          }[match.status];

          return (
            <Card key={match.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant="league">{match.league}</Badge>
                  <Badge variant={statusBadge}>
                    {match.status === "live" ? "EN DIRECT" : match.status}
                  </Badge>
                  <span className="text-sm font-medium truncate">
                    {match.team_a_name} vs {match.team_b_name}
                  </span>
                  {match.status !== "upcoming" && (
                    <span className="text-sm font-mono text-[#64748B]">
                      {match.score_a} - {match.score_b}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-[#64748B]">{formatDate(match.starts_at)}</span>
                  <Link
                    href={`/match/${match.id}`}
                    className="text-xs text-[#00D4FF] hover:underline"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}

        {typedMatches.length === 0 && (
          <p className="text-center text-[#64748B] py-8">Aucun match</p>
        )}
      </div>
    </div>
  );
}
