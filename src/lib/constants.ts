import type { League, BetType } from "@/types";

export const LOL_LEAGUES: readonly League[] = [
  { id: "worlds", name: "Worlds", region: "International", tier: 1 },
  { id: "msi", name: "MSI", region: "International", tier: 1 },
  { id: "lck", name: "LCK", region: "Corée", tier: 1 },
  { id: "lpl", name: "LPL", region: "Chine", tier: 1 },
  { id: "lec", name: "LEC", region: "Europe", tier: 1 },
  { id: "lcs", name: "LCS", region: "Amérique du Nord", tier: 1 },
  { id: "lfl", name: "LFL", region: "France", tier: 2 },
  { id: "cblol", name: "CBLOL", region: "Brésil", tier: 2 },
  { id: "pcs", name: "PCS", region: "Pacifique", tier: 2 },
  { id: "vcs", name: "VCS", region: "Vietnam", tier: 2 },
] as const;

export const BET_TYPES: Record<BetType, string> = {
  match_winner: "Vainqueur du match",
  map_winner: "Vainqueur de la map",
  first_blood: "Premier sang",
  first_tower: "Première tour",
  first_dragon: "Premier dragon",
  total_kills_over_under: "Total kills (Over/Under)",
  match_duration: "Durée du match (Over/Under)",
};

export const BET_LIMITS = {
  min: 1,
  max: 500,
} as const;

export const RATE_LIMITS = {
  betsPerMinute: 10,
} as const;
