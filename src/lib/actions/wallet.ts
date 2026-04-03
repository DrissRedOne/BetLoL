"use server";

import { createClient } from "@/lib/supabase/server";
import { depositSchema, withdrawalSchema } from "@/lib/validators/bet";

// TODO: intégrer Stripe Checkout pour la production
// En V1, dépôts et retraits sont simulés via des fonctions RPC atomiques.

interface WalletResponse {
  success: boolean;
  error?: string;
  newBalance?: number;
}

export async function simulateDeposit(amount: number): Promise<WalletResponse> {
  const validation = depositSchema.safeParse({ amount });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? "Montant invalide" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté" };
  }

  const { data, error } = await supabase.rpc("simulate_deposit", {
    p_user_id: user.id,
    p_amount: validation.data.amount,
  });

  if (error) {
    const msg = error.message.replace(/^.*RAISE EXCEPTION\s*/, "").trim();
    return { success: false, error: msg || "Erreur lors du dépôt" };
  }

  const result = data as unknown as { new_balance: number } | null;
  return { success: true, newBalance: result?.new_balance ?? 0 };
}

export async function simulateWithdrawal(amount: number): Promise<WalletResponse> {
  const validation = withdrawalSchema.safeParse({ amount });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? "Montant invalide" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté" };
  }

  const { data, error } = await supabase.rpc("simulate_withdrawal", {
    p_user_id: user.id,
    p_amount: validation.data.amount,
  });

  if (error) {
    const msg = error.message.replace(/^.*RAISE EXCEPTION\s*/, "").trim();
    return { success: false, error: msg || "Erreur lors du retrait" };
  }

  const result = data as unknown as { new_balance: number } | null;
  return { success: true, newBalance: result?.new_balance ?? 0 };
}
