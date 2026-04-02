import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LolMatch } from "@/types";
import { AdminMatchsClient } from "./admin-matchs-client";

export default async function AdminMatchsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const { data: matchesRaw } = await supabase
    .from("lol_matches")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(200);

  const matches = (matchesRaw ?? []) as unknown as LolMatch[];

  return <AdminMatchsClient matches={matches} />;
}
