"use server";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Accès refusé");
  return supabase;
}

interface SyncResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

export async function triggerSyncMatches(): Promise<SyncResult> {
  try {
    await requireAdmin();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) return { success: false, error: "Supabase URL not configured" };

    const response = await fetch(
      `${supabaseUrl}/functions/v1/sync-matches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { success: false, error: `Sync failed: ${response.status} ${body.slice(0, 200)}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function triggerSyncResults(): Promise<SyncResult> {
  try {
    await requireAdmin();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) return { success: false, error: "Supabase URL not configured" };

    const response = await fetch(
      `${supabaseUrl}/functions/v1/sync-results`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { success: false, error: `Sync failed: ${response.status} ${body.slice(0, 200)}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
