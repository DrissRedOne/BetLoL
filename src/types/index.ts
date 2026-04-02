// ============================================
// Domain enums (string unions matching DB CHECK constraints)
// ============================================

export type UserRole = "user" | "admin";
export type KycStatus = "pending" | "verified" | "rejected";
export type MatchStatus = "upcoming" | "live" | "finished" | "cancelled";
export type MatchWinner = "team_a" | "team_b";
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

// ============================================
// Row interfaces (strict domain types for app code)
// ============================================

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
  winner: MatchWinner | null;
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

// ============================================
// Join types (for queries with relations)
// ============================================

export interface BetWithDetails extends Bet {
  lol_matches: LolMatch;
  odds: Odd;
}

// ============================================
// Non-DB types
// ============================================

export interface League {
  id: string;
  name: string;
  region: string;
  tier: number;
}

// ============================================
// RPC return types
// ============================================

export interface PlaceBetResult {
  id: string;
  user_id: string;
  match_id: string;
  odd_id: string;
  selection: string;
  amount: number;
  locked_odd: number;
  potential_gain: number;
  status: string;
  settled_at: string | null;
  created_at: string;
}

export interface SettleMatchResult {
  match_id: string;
  winner: string;
  bets_won: number;
  bets_lost: number;
  bets_total: number;
}

export interface CancelMatchResult {
  match_id: string;
  bets_refunded: number;
  total_refunded: number;
}

// ============================================
// Supabase Database type
// ============================================
// Uses plain `string` for enum-like columns in Row types
// to avoid postgrest-js query parser `never` resolution.
// Cast to domain types (Profile, LolMatch, etc.) in app code.
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          balance: number;
          role: string;
          kyc_status: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          balance?: number;
          role?: string;
          kyc_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          balance?: number;
          role?: string;
          kyc_status?: string;
        };
        Relationships: [];
      };
      lol_matches: {
        Row: {
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
          status: string;
          starts_at: string;
          finished_at: string | null;
          winner: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          league: string;
          tournament?: string | null;
          team_a_name: string;
          team_a_logo?: string | null;
          team_b_name: string;
          team_b_logo?: string | null;
          best_of?: number;
          score_a?: number;
          score_b?: number;
          status?: string;
          starts_at: string;
          finished_at?: string | null;
          winner?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          league?: string;
          tournament?: string | null;
          team_a_name?: string;
          team_a_logo?: string | null;
          team_b_name?: string;
          team_b_logo?: string | null;
          best_of?: number;
          score_a?: number;
          score_b?: number;
          status?: string;
          starts_at?: string;
          finished_at?: string | null;
          winner?: string | null;
        };
        Relationships: [];
      };
      odds: {
        Row: {
          id: string;
          match_id: string;
          bet_type: string;
          label_a: string;
          label_b: string;
          odd_a: number;
          odd_b: number;
          map_number: number | null;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          bet_type: string;
          label_a: string;
          label_b: string;
          odd_a: number;
          odd_b: number;
          map_number?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          bet_type?: string;
          label_a?: string;
          label_b?: string;
          odd_a?: number;
          odd_b?: number;
          map_number?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "odds_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "lol_matches";
            referencedColumns: ["id"];
          },
        ];
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          odd_id: string;
          selection: string;
          amount: number;
          locked_odd: number;
          potential_gain: number;
          status: string;
          settled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          odd_id: string;
          selection: string;
          amount: number;
          locked_odd: number;
          potential_gain: number;
          status?: string;
          settled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          odd_id?: string;
          selection?: string;
          amount?: number;
          locked_odd?: number;
          potential_gain?: number;
          status?: string;
          settled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bets_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "lol_matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bets_odd_id_fkey";
            columns: ["odd_id"];
            isOneToOne: false;
            referencedRelation: "odds";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          reference: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          reference?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount?: number;
          balance_after?: number;
          reference?: string | null;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      place_bet: {
        Args: {
          p_user_id: string;
          p_odd_id: string;
          p_selection: string;
          p_amount: number;
        };
        Returns: PlaceBetResult;
      };
      settle_match: {
        Args: {
          p_match_id: string;
          p_winner: string;
        };
        Returns: SettleMatchResult;
      };
      cancel_match: {
        Args: {
          p_match_id: string;
        };
        Returns: CancelMatchResult;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
