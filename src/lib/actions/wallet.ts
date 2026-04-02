"use server";

import { createClient } from "@/lib/supabase/server";
import { depositSchema, withdrawalSchema } from "@/lib/validators/bet";

// TODO: intégrer Stripe Checkout pour la production
// En V1, dépôts et retraits sont simulés via insertion directe en DB.

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

  // Get current balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "Profil introuvable" };
  }

  const newBalance = profile.balance + validation.data.amount;

  // Update balance
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: "Erreur lors de la mise à jour du solde" };
  }

  // Insert transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "deposit",
    amount: validation.data.amount,
    balance_after: newBalance,
    description: `Dépôt de ${validation.data.amount.toFixed(2)}€ (simulation)`,
  });

  return { success: true, newBalance };
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "Profil introuvable" };
  }

  if (profile.balance < validation.data.amount) {
    return { success: false, error: `Solde insuffisant (${profile.balance.toFixed(2)}€)` };
  }

  const newBalance = profile.balance - validation.data.amount;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: "Erreur lors de la mise à jour du solde" };
  }

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "withdrawal",
    amount: validation.data.amount,
    balance_after: newBalance,
    description: `Retrait de ${validation.data.amount.toFixed(2)}€ (simulation)`,
  });

  return { success: true, newBalance };
}
