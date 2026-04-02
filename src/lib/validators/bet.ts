import { z } from "zod/v4";

export const placeBetSchema = z.object({
  oddId: z.uuid(),
  selection: z.enum(["a", "b"]),
  amount: z
    .number()
    .min(1, "La mise minimum est de 1€")
    .max(500, "La mise maximum est de 500€"),
});

export type PlaceBetInput = z.infer<typeof placeBetSchema>;

export const depositSchema = z.object({
  amount: z
    .number()
    .min(5, "Le dépôt minimum est de 5€")
    .max(10000, "Le dépôt maximum est de 10 000€"),
});

export type DepositInput = z.infer<typeof depositSchema>;

export const withdrawalSchema = z.object({
  amount: z
    .number()
    .min(10, "Le retrait minimum est de 10€")
    .max(10000, "Le retrait maximum est de 10 000€"),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;

export const settleMatchSchema = z.object({
  matchId: z.uuid(),
  winner: z.enum(["team_a", "team_b"]),
});

export type SettleMatchInput = z.infer<typeof settleMatchSchema>;
