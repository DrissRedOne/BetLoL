"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

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

// ── Create match ──────────────────────────────────────────────

export interface CreateMatchInput {
  league: string;
  tournament: string;
  team_a_name: string;
  team_a_logo: string;
  team_b_name: string;
  team_b_logo: string;
  best_of: number;
  starts_at: string;
}

export async function createMatch(input: CreateMatchInput): Promise<ActionResult & { matchId?: string }> {
  try {
    const supabase = await requireAdmin();

    const { data, error } = await supabase
      .from("lol_matches")
      .insert({
        league: input.league,
        tournament: input.tournament || null,
        team_a_name: input.team_a_name,
        team_a_logo: input.team_a_logo || null,
        team_b_name: input.team_b_name,
        team_b_logo: input.team_b_logo || null,
        best_of: input.best_of,
        starts_at: input.starts_at,
        status: "upcoming",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, matchId: data.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ── Update match ──────────────────────────────────────────────

export interface UpdateMatchInput {
  id: string;
  league?: string;
  tournament?: string;
  team_a_name?: string;
  team_b_name?: string;
  best_of?: number;
  status?: string;
  score_a?: number;
  score_b?: number;
  starts_at?: string;
}

export async function updateMatch(input: UpdateMatchInput): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const { id, ...fields } = input;
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== "") updateData[key] = value;
    }

    const { error } = await supabase
      .from("lol_matches")
      .update(updateData)
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ── Upsert odds ───────────────────────────────────────────────

export interface UpsertOddInput {
  match_id: string;
  bet_type: string;
  label_a: string;
  label_b: string;
  odd_a: number;
  odd_b: number;
  map_number?: number | null;
}

export async function upsertOdd(input: UpsertOddInput): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    // Check if an odd already exists for this match + bet_type + map_number
    let query = supabase
      .from("odds")
      .select("id")
      .eq("match_id", input.match_id)
      .eq("bet_type", input.bet_type);

    if (input.map_number) {
      query = query.eq("map_number", input.map_number);
    } else {
      query = query.is("map_number", null);
    }

    const { data: existing } = await query.single();

    if (existing) {
      const { error } = await supabase
        .from("odds")
        .update({
          label_a: input.label_a,
          label_b: input.label_b,
          odd_a: input.odd_a,
          odd_b: input.odd_b,
          is_active: true,
        })
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("odds").insert({
        match_id: input.match_id,
        bet_type: input.bet_type,
        label_a: input.label_a,
        label_b: input.label_b,
        odd_a: input.odd_a,
        odd_b: input.odd_b,
        map_number: input.map_number ?? null,
        is_active: true,
      });
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ── Settle match ──────────────────────────────────────────────

export interface SettleResult {
  success: boolean;
  error?: string;
  betsWon?: number;
  betsLost?: number;
  betsTotal?: number;
}

export async function settleMatch(matchId: string, winner: "team_a" | "team_b"): Promise<SettleResult> {
  try {
    const supabase = await requireAdmin();

    const { data, error } = await supabase.rpc("settle_match", {
      p_match_id: matchId,
      p_winner: winner,
    });

    if (error) return { success: false, error: error.message };

    const result = data as unknown as {
      bets_won: number;
      bets_lost: number;
      bets_total: number;
    } | null;

    return {
      success: true,
      betsWon: result?.bets_won ?? 0,
      betsLost: result?.bets_lost ?? 0,
      betsTotal: result?.bets_total ?? 0,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ── Cancel match ──────────────────────────────────────────────

export interface CancelResult {
  success: boolean;
  error?: string;
  betsRefunded?: number;
  totalRefunded?: number;
}

export async function cancelMatch(matchId: string): Promise<CancelResult> {
  try {
    const supabase = await requireAdmin();

    const { data, error } = await supabase.rpc("cancel_match", {
      p_match_id: matchId,
    });

    if (error) return { success: false, error: error.message };

    const result = data as unknown as {
      bets_refunded: number;
      total_refunded: number;
    } | null;

    return {
      success: true,
      betsRefunded: result?.bets_refunded ?? 0,
      totalRefunded: result?.total_refunded ?? 0,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
