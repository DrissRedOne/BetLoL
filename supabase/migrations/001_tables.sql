-- ============================================
-- BetLoL — 001 Tables
-- ============================================

-- ------------------------------------------------
-- profiles (extends auth.users)
-- ------------------------------------------------
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL
                    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  avatar_url      TEXT,
  balance         DECIMAL(10,2) NOT NULL DEFAULT 0.00
                    CONSTRAINT balance_non_negative CHECK (balance >= 0),
  role            TEXT NOT NULL DEFAULT 'user'
                    CONSTRAINT valid_role CHECK (role IN ('user', 'admin')),
  kyc_status      TEXT NOT NULL DEFAULT 'pending'
                    CONSTRAINT valid_kyc_status CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.balance IS 'Account balance in EUR, debited/credited atomically via RPC';

-- ------------------------------------------------
-- lol_matches
-- ------------------------------------------------
CREATE TABLE lol_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT UNIQUE,
  league          TEXT NOT NULL
                    CONSTRAINT league_not_empty CHECK (char_length(league) > 0),
  tournament      TEXT,
  team_a_name     TEXT NOT NULL
                    CONSTRAINT team_a_not_empty CHECK (char_length(team_a_name) > 0),
  team_a_logo     TEXT,
  team_b_name     TEXT NOT NULL
                    CONSTRAINT team_b_not_empty CHECK (char_length(team_b_name) > 0),
  team_b_logo     TEXT,
  best_of         INT NOT NULL DEFAULT 1
                    CONSTRAINT valid_best_of CHECK (best_of IN (1, 3, 5)),
  score_a         INT NOT NULL DEFAULT 0
                    CONSTRAINT score_a_non_negative CHECK (score_a >= 0),
  score_b         INT NOT NULL DEFAULT 0
                    CONSTRAINT score_b_non_negative CHECK (score_b >= 0),
  status          TEXT NOT NULL DEFAULT 'upcoming'
                    CONSTRAINT valid_match_status CHECK (status IN ('upcoming', 'live', 'finished', 'cancelled')),
  starts_at       TIMESTAMPTZ NOT NULL,
  finished_at     TIMESTAMPTZ,
  winner          TEXT
                    CONSTRAINT valid_winner CHECK (winner IS NULL OR winner IN ('team_a', 'team_b')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A match can only have a winner when finished
  CONSTRAINT winner_only_when_finished CHECK (
    (winner IS NULL) OR (status = 'finished')
  ),
  -- finished_at only when finished or cancelled
  CONSTRAINT finished_at_coherence CHECK (
    (finished_at IS NULL) OR (status IN ('finished', 'cancelled'))
  )
);

COMMENT ON TABLE lol_matches IS 'League of Legends matches from PandaScore or manually created';

-- ------------------------------------------------
-- odds
-- ------------------------------------------------
CREATE TABLE odds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID NOT NULL REFERENCES lol_matches(id) ON DELETE CASCADE,
  bet_type        TEXT NOT NULL
                    CONSTRAINT valid_bet_type CHECK (bet_type IN (
                      'match_winner',
                      'map_winner',
                      'first_blood',
                      'first_tower',
                      'first_dragon',
                      'total_kills_over_under',
                      'match_duration'
                    )),
  label_a         TEXT NOT NULL,
  label_b         TEXT NOT NULL,
  odd_a           DECIMAL(5,2) NOT NULL
                    CONSTRAINT odd_a_minimum CHECK (odd_a >= 1.01),
  odd_b           DECIMAL(5,2) NOT NULL
                    CONSTRAINT odd_b_minimum CHECK (odd_b >= 1.01),
  map_number      INT
                    CONSTRAINT valid_map_number CHECK (map_number IS NULL OR (map_number >= 1 AND map_number <= 5)),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- map_number required for map_winner, NULL for others
  CONSTRAINT map_number_coherence CHECK (
    (bet_type = 'map_winner' AND map_number IS NOT NULL)
    OR (bet_type != 'map_winner' AND map_number IS NULL)
  ),
  -- Unique constraint: one active odd per bet_type+map_number per match
  CONSTRAINT unique_active_odd UNIQUE (match_id, bet_type, map_number)
);

COMMENT ON TABLE odds IS 'Betting odds for each market on a match';

-- ------------------------------------------------
-- bets
-- ------------------------------------------------
CREATE TABLE bets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id        UUID NOT NULL REFERENCES lol_matches(id) ON DELETE CASCADE,
  odd_id          UUID NOT NULL REFERENCES odds(id),
  selection       TEXT NOT NULL
                    CONSTRAINT valid_selection CHECK (selection IN ('a', 'b')),
  amount          DECIMAL(10,2) NOT NULL
                    CONSTRAINT valid_bet_amount CHECK (amount >= 1 AND amount <= 500),
  locked_odd      DECIMAL(5,2) NOT NULL
                    CONSTRAINT locked_odd_minimum CHECK (locked_odd >= 1.01),
  potential_gain  DECIMAL(10,2) NOT NULL
                    CONSTRAINT potential_gain_positive CHECK (potential_gain > 0),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CONSTRAINT valid_bet_status CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'refunded')),
  settled_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- settled_at only when status is resolved
  CONSTRAINT settled_at_coherence CHECK (
    (settled_at IS NULL AND status = 'pending')
    OR (settled_at IS NOT NULL AND status IN ('won', 'lost', 'cancelled', 'refunded'))
  )
);

COMMENT ON TABLE bets IS 'User bets with locked odds at placement time';

-- ------------------------------------------------
-- transactions
-- ------------------------------------------------
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL
                    CONSTRAINT valid_tx_type CHECK (type IN (
                      'deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_refund'
                    )),
  amount          DECIMAL(10,2) NOT NULL
                    CONSTRAINT amount_positive CHECK (amount > 0),
  balance_after   DECIMAL(10,2) NOT NULL
                    CONSTRAINT balance_after_non_negative CHECK (balance_after >= 0),
  reference       TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE transactions IS 'Immutable audit log of all balance mutations';
