-- BetLoL — Initial Database Schema
-- Paris Esportifs League of Legends

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  avatar_url      TEXT,
  balance         DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  role            TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  kyc_status      TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- LoL Matches
CREATE TABLE IF NOT EXISTS lol_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT UNIQUE,
  league          TEXT NOT NULL,
  tournament      TEXT,
  team_a_name     TEXT NOT NULL,
  team_a_logo     TEXT,
  team_b_name     TEXT NOT NULL,
  team_b_logo     TEXT,
  best_of         INT DEFAULT 1,
  score_a         INT DEFAULT 0,
  score_b         INT DEFAULT 0,
  status          TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished', 'cancelled')),
  starts_at       TIMESTAMPTZ NOT NULL,
  finished_at     TIMESTAMPTZ,
  winner          TEXT CHECK (winner IN ('team_a', 'team_b')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Odds
CREATE TABLE IF NOT EXISTS odds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID REFERENCES lol_matches(id) ON DELETE CASCADE,
  bet_type        TEXT NOT NULL CHECK (bet_type IN (
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
  odd_a           DECIMAL(5,2) NOT NULL CHECK (odd_a >= 1.01),
  odd_b           DECIMAL(5,2) NOT NULL CHECK (odd_b >= 1.01),
  map_number      INT,
  is_active       BOOLEAN DEFAULT true,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Bets
CREATE TABLE IF NOT EXISTS bets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id        UUID REFERENCES lol_matches(id) ON DELETE CASCADE,
  odd_id          UUID REFERENCES odds(id),
  selection       TEXT NOT NULL CHECK (selection IN ('a', 'b')),
  amount          DECIMAL(10,2) NOT NULL CHECK (amount >= 1 AND amount <= 500),
  locked_odd      DECIMAL(5,2) NOT NULL,
  potential_gain  DECIMAL(10,2) NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'refunded')),
  settled_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_refund')),
  amount          DECIMAL(10,2) NOT NULL,
  balance_after   DECIMAL(10,2) NOT NULL,
  reference       TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_matches_status ON lol_matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_starts_at ON lol_matches(starts_at);
CREATE INDEX IF NOT EXISTS idx_matches_league ON lol_matches(league);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_odds_match ON odds(match_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lol_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- LoL Matches: public read, admin write
CREATE POLICY "Anyone can read matches"
  ON lol_matches FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage matches"
  ON lol_matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Odds: public read, admin write
CREATE POLICY "Anyone can read odds"
  ON odds FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage odds"
  ON odds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bets: users can only see their own bets
CREATE POLICY "Users can read own bets"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Transactions: users can only see their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE odds;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Place a bet (atomic transaction)
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_odd_id UUID,
  p_selection TEXT,
  p_amount DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_odd RECORD;
  v_match RECORD;
  v_locked_odd DECIMAL(5,2);
  v_potential_gain DECIMAL(10,2);
  v_bet_id UUID;
  v_new_balance DECIMAL(10,2);
BEGIN
  -- Get the odd and lock the row
  SELECT * INTO v_odd FROM odds WHERE id = p_odd_id AND is_active = true FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cote non disponible';
  END IF;

  -- Get the match and check status
  SELECT * INTO v_match FROM lol_matches WHERE id = v_odd.match_id FOR UPDATE;
  IF v_match.status NOT IN ('upcoming', 'live') THEN
    RAISE EXCEPTION 'Match non disponible pour les paris';
  END IF;

  -- Validate selection
  IF p_selection NOT IN ('a', 'b') THEN
    RAISE EXCEPTION 'Sélection invalide';
  END IF;

  -- Validate amount
  IF p_amount < 1 OR p_amount > 500 THEN
    RAISE EXCEPTION 'Montant de mise invalide (1€ - 500€)';
  END IF;

  -- Snapshot the odd
  IF p_selection = 'a' THEN
    v_locked_odd := v_odd.odd_a;
  ELSE
    v_locked_odd := v_odd.odd_b;
  END IF;

  v_potential_gain := ROUND(p_amount * v_locked_odd, 2);

  -- Debit balance (will fail if insufficient due to CHECK constraint)
  UPDATE profiles
    SET balance = balance - p_amount
    WHERE id = p_user_id AND balance >= p_amount
    RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solde insuffisant';
  END IF;

  -- Insert the bet
  INSERT INTO bets (user_id, match_id, odd_id, selection, amount, locked_odd, potential_gain)
    VALUES (p_user_id, v_match.id, p_odd_id, p_selection, p_amount, v_locked_odd, v_potential_gain)
    RETURNING id INTO v_bet_id;

  -- Insert transaction record
  INSERT INTO transactions (user_id, type, amount, balance_after, reference, description)
    VALUES (
      p_user_id,
      'bet_placed',
      p_amount,
      v_new_balance,
      v_bet_id::TEXT,
      'Pari: ' || v_match.team_a_name || ' vs ' || v_match.team_b_name
    );

  RETURN v_bet_id;
END;
$$;

-- Settle a match (atomic transaction)
CREATE OR REPLACE FUNCTION settle_match(
  p_match_id UUID,
  p_winner TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bet RECORD;
  v_count INT := 0;
  v_new_balance DECIMAL(10,2);
BEGIN
  -- Validate winner
  IF p_winner NOT IN ('team_a', 'team_b') THEN
    RAISE EXCEPTION 'Gagnant invalide';
  END IF;

  -- Update match status
  UPDATE lol_matches
    SET status = 'finished', winner = p_winner, finished_at = now()
    WHERE id = p_match_id AND winner IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match non trouvé ou déjà résolu';
  END IF;

  -- Process all pending bets for this match (match_winner type)
  FOR v_bet IN
    SELECT b.* FROM bets b
    JOIN odds o ON b.odd_id = o.id
    WHERE b.match_id = p_match_id
      AND b.status = 'pending'
      AND o.bet_type = 'match_winner'
    FOR UPDATE OF b
  LOOP
    IF (p_winner = 'team_a' AND v_bet.selection = 'a')
       OR (p_winner = 'team_b' AND v_bet.selection = 'b')
    THEN
      -- Won: credit potential gain
      UPDATE bets SET status = 'won', settled_at = now() WHERE id = v_bet.id;

      UPDATE profiles
        SET balance = balance + v_bet.potential_gain
        WHERE id = v_bet.user_id
        RETURNING balance INTO v_new_balance;

      INSERT INTO transactions (user_id, type, amount, balance_after, reference, description)
        VALUES (
          v_bet.user_id,
          'bet_won',
          v_bet.potential_gain,
          v_new_balance,
          v_bet.id::TEXT,
          'Pari gagné'
        );
    ELSE
      -- Lost
      UPDATE bets SET status = 'lost', settled_at = now() WHERE id = v_bet.id;
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
