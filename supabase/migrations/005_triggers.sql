-- ============================================
-- BetLoL — 005 Triggers
-- ============================================

-- ------------------------------------------------
-- Auto-create profile on auth.users insert
-- ------------------------------------------------
-- When a user signs up via Supabase Auth, this trigger
-- automatically creates a profile row with default values.
-- The username is taken from raw_user_meta_data.username
-- (passed during signUp) or falls back to the email prefix.
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Try to get username from signup metadata
  v_username := NEW.raw_user_meta_data ->> 'username';

  -- Fallback to email prefix if no username provided
  IF v_username IS NULL OR char_length(v_username) < 3 THEN
    v_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Ensure uniqueness by appending random suffix if needed
  IF EXISTS (SELECT 1 FROM profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || substr(gen_random_uuid()::TEXT, 1, 4);
  END IF;

  -- Truncate to 30 chars max
  v_username := substr(v_username, 1, 30);

  INSERT INTO profiles (id, username, balance, role, kyc_status)
  VALUES (
    NEW.id,
    v_username,
    0.00,
    'user',
    'pending'
  );

  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Auto-create profile row when a new user registers via Supabase Auth';

-- ------------------------------------------------
-- Auto-update odds.updated_at on change
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION update_odds_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_odds_update
  BEFORE UPDATE ON odds
  FOR EACH ROW
  EXECUTE FUNCTION update_odds_timestamp();

-- ------------------------------------------------
-- Realtime subscriptions
-- ------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE odds;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE lol_matches;
