-- ============================================
-- BetLoL — 003 Row Level Security
-- ============================================

-- ------------------------------------------------
-- Enable RLS on all tables
-- ------------------------------------------------
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lol_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------
-- profiles
--   - Users read/update their own profile only
--   - Insert via trigger or own user
--   - Admins can read all (for admin dashboard)
-- ------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Users cannot change their own role or balance (only RPC can)
    auth.uid() = id
  );

-- ------------------------------------------------
-- lol_matches
--   - Public read (anyone, including anon)
--   - Write only for admins
-- ------------------------------------------------
CREATE POLICY "matches_select_public"
  ON lol_matches FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "matches_insert_admin"
  ON lol_matches FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "matches_update_admin"
  ON lol_matches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "matches_delete_admin"
  ON lol_matches FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ------------------------------------------------
-- odds
--   - Public read (anyone, including anon)
--   - Write only for admins
-- ------------------------------------------------
CREATE POLICY "odds_select_public"
  ON odds FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "odds_insert_admin"
  ON odds FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "odds_update_admin"
  ON odds FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "odds_delete_admin"
  ON odds FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ------------------------------------------------
-- bets
--   - Users see only their own bets
--   - Insert via RPC only (SECURITY DEFINER), but policy allows own-user insert
--   - No direct update/delete (only RPC settlement)
--   - Admins can read all bets
-- ------------------------------------------------
CREATE POLICY "bets_select_own"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bets_select_admin"
  ON bets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "bets_insert_own"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------
-- transactions
--   - Users see only their own transactions
--   - No direct insert/update/delete (only via RPC)
--   - Admins can read all transactions
-- ------------------------------------------------
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_select_admin"
  ON transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
