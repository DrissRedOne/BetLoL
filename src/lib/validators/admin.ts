import { z } from "zod/v4";

export const createMatchSchema = z.object({
  league: z.string().min(1, "Ligue requise"),
  tournament: z.string(),
  team_a_name: z.string().min(1, "Nom équipe A requis"),
  team_a_logo: z.string(),
  team_b_name: z.string().min(1, "Nom équipe B requis"),
  team_b_logo: z.string(),
  best_of: z.number().refine((v) => [1, 3, 5].includes(v), "Format invalide"),
  starts_at: z.string().min(1, "Date requise"),
});

export const updateMatchSchema = z.object({
  id: z.uuid(),
  league: z.string().optional(),
  tournament: z.string().optional(),
  team_a_name: z.string().optional(),
  team_b_name: z.string().optional(),
  best_of: z.number().optional(),
  status: z.enum(["upcoming", "live", "finished", "cancelled"]).optional(),
  score_a: z.number().min(0).optional(),
  score_b: z.number().min(0).optional(),
  starts_at: z.string().optional(),
});

export const upsertOddSchema = z.object({
  match_id: z.uuid(),
  bet_type: z.enum([
    "match_winner", "map_winner", "first_blood",
    "first_tower", "first_dragon", "total_kills_over_under", "match_duration",
  ]),
  label_a: z.string().min(1),
  label_b: z.string().min(1),
  odd_a: z.number().min(1.01, "Cote minimum 1.01"),
  odd_b: z.number().min(1.01, "Cote minimum 1.01"),
  map_number: z.number().min(1).max(5).nullable().optional(),
});

export const settleMatchSchema = z.object({
  matchId: z.uuid(),
  winner: z.enum(["team_a", "team_b"]),
});

export const cancelMatchSchema = z.object({
  matchId: z.uuid(),
});
