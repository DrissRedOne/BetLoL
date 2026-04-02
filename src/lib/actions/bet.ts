"use server";

import { createClient } from "@/lib/supabase/server";
import { placeBetSchema } from "@/lib/validators/bet";

interface PlaceBetResponse {
  success: boolean;
  error?: string;
  betId?: string;
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

  const { data, error } = await supabase.rpc("place_bet", {
    p_user_id: user.id,
    p_odd_id: validation.data.oddId,
    p_selection: validation.data.selection,
    p_amount: validation.data.amount,
  });

  if (error) {
    // Extract clean error message from Postgres exception
    const message = error.message
      .replace(/^.*RAISE EXCEPTION\s*/, "")
      .replace(/\\n.*$/, "")
      .trim();
    return { success: false, error: message || "Erreur lors du placement du pari" };
  }

  const result = data as unknown as { id: string } | null;
  return { success: true, betId: result?.id };
}
