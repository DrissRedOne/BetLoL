"use server";

import { createClient } from "@/lib/supabase/server";
import { placeBetSchema } from "@/lib/validators/bet";

interface PlaceBetResponse {
  success: boolean;
  error?: string;
  betId?: string;
}

// ── Rate limiter (in-memory, resets on server restart) ─────────
// Max 10 bets per minute per user (V1)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function placeBet(
  oddId: string,
  selection: "a" | "b",
  amount: number
): Promise<PlaceBetResponse> {
  const validation = placeBetSchema.safeParse({ oddId, selection, amount });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté pour parier" };
  }

  // Rate limiting
  if (!checkRateLimit(user.id)) {
    return { success: false, error: "Trop de paris. Attendez une minute avant de réessayer." };
  }

  const { data, error } = await supabase.rpc("place_bet", {
    p_user_id: user.id,
    p_odd_id: validation.data.oddId,
    p_selection: validation.data.selection,
    p_amount: validation.data.amount,
  });

  if (error) {
    const message = error.message
      .replace(/^.*RAISE EXCEPTION\s*/, "")
      .replace(/\\n.*$/, "")
      .trim();
    return { success: false, error: message || "Erreur lors du placement du pari" };
  }

  const result = data as unknown as { id: string } | null;
  return { success: true, betId: result?.id };
}
