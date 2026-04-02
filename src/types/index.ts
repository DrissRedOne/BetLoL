export type UserRole = "user" | "admin";
export type KycStatus = "pending" | "verified" | "rejected";
export type MatchStatus = "upcoming" | "live" | "finished" | "cancelled";
export type MatchWinner = "team_a" | "team_b" | null;
export type BetStatus = "pending" | "won" | "lost" | "cancelled" | "refunded";
export type BetSelection = "a" | "b";
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bet_placed"
  | "bet_won"
  | "bet_refund";
export type BetType =
  | "match_winner"
  | "map_winner"
  | "first_blood"
  | "first_tower"
  | "first_dragon"
  | "total_kills_over_under"
  | "match_duration";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  balance: number;
  role: UserRole;
  kyc_status: KycStatus;
  created_at: string;
}

export interface LolMatch {
  id: string;
  external_id: string | null;
  league: string;
  tournament: string | null;
  team_a_name: string;
  team_a_logo: string | null;
  team_b_name: string;
  team_b_logo: string | null;
  best_of: number;
  score_a: number;
  score_b: number;
  status: MatchStatus;
  starts_at: string;
  finished_at: string | null;
  winner: MatchWinner;
  created_at: string;
}

export interface Odd {
  id: string;
  match_id: string;
  bet_type: BetType;
  label_a: string;
  label_b: string;
  odd_a: number;
  odd_b: number;
  map_number: number | null;
  is_active: boolean;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  match_id: string;
  odd_id: string;
  selection: BetSelection;
  amount: number;
  locked_odd: number;
  potential_gain: number;
  status: BetStatus;
  settled_at: string | null;
  created_at: string;
}

export interface BetWithDetails extends Bet {
  lol_matches: LolMatch;
  odds: Odd;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  reference: string | null;
  description: string | null;
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  region: string;
  tier: number;
}
