-- ============================================
-- BetLoL — 004 RPC Functions
-- ============================================
-- All financial mutations happen here, never client-side.
-- SECURITY DEFINER = runs as the DB owner, bypasses RLS.

-- ------------------------------------------------
-- place_bet: atomic bet placement
-- ------------------------------------------------
-- 1. Verifies match is upcoming/live
-- 2. Verifies odd is active
-- 3. Verifies balance >= amount
-- 4. Snapshots current odd → locked_odd
-- 5. Debits balance
-- 6. Inserts bet
-- 7. Inserts transaction
-- 8. Returns the full bet row
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id   UUID,
  p_odd_id    UUID,
  p_selection TEXT,
  p_amount    DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_odd          RECORD;
  v_match        RECORD;
  v_profile      RECORD;
  v_locked_odd   DECIMAL(5,2);
  v_potential_gain DECIMAL(10,2);
  v_bet_id       UUID;
  v_new_balance  DECIMAL(10,2);
  v_bet          RECORD;
BEGIN
  -- ---- Validate inputs ----
  IF p_selection NOT IN ('a', 'b') THEN
    RAISE EXCEPTION 'Sélection invalide : "%" (attendu "a" ou "b")', p_selection;
  END IF;

  IF p_amount < 1 THEN
    RAISE EXCEPTION 'Mise minimum : 1€ (reçu : %€)', p_amount;
  END IF;

  IF p_amount > 500 THEN
    RAISE EXCEPTION 'Mise maximum : 500€ (reçu : %€)', p_amount;
  END IF;

  -- ---- Lock and fetch the odd ----
  SELECT * INTO v_odd
    FROM odds
    WHERE id = p_odd_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cote introuvable (id: %)', p_odd_id;
  END IF;

  IF NOT v_odd.is_active THEN
    RAISE EXCEPTION 'Cette cote n''est plus active';
  END IF;

  -- ---- Lock and fetch the match ----
  SELECT * INTO v_match
    FROM lol_matches
    WHERE id = v_odd.match_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match introuvable';
  END IF;

  IF v_match.status NOT IN ('upcoming', 'live') THEN
    RAISE EXCEPTION 'Ce match n''accepte plus de paris (statut: %)', v_match.status;
  END IF;

  -- ---- Snapshot the odd ----
  IF p_selection = 'a' THEN
    v_locked_odd := v_odd.odd_a;
  ELSE
    v_locked_odd := v_odd.odd_b;
  END IF;

  v_potential_gain := ROUND(p_amount * v_locked_odd, 2);

  -- ---- Debit balance (lock profile row) ----
  SELECT * INTO v_profile
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;

  IF v_profile.balance < p_amount THEN
    RAISE EXCEPTION 'Solde insuffisant (solde: %€, mise: %€)', v_profile.balance, p_amount;
  END IF;

  v_new_balance := v_profile.balance - p_amount;

  UPDATE profiles
    SET balance = v_new_balance
    WHERE id = p_user_id;

  -- ---- Insert the bet ----
  INSERT INTO bets (
    user_id, match_id, odd_id, selection,
    amount, locked_odd, potential_gain, status
  ) VALUES (
    p_user_id, v_match.id, p_odd_id, p_selection,
    p_amount, v_locked_odd, v_potential_gain, 'pending'
  )
  RETURNING id INTO v_bet_id;

  -- ---- Insert transaction ----
  INSERT INTO transactions (user_id, type, amount, balance_after, reference, description)
  VALUES (
    p_user_id,
    'bet_placed',
    p_amount,
    v_new_balance,
    v_bet_id::TEXT,
    'Pari : ' || v_match.team_a_name || ' vs ' || v_match.team_b_name
      || ' — ' || (CASE WHEN p_selection = 'a' THEN v_odd.label_a ELSE v_odd.label_b END)
      || ' @ ' || v_locked_odd
  );

  -- ---- Return the created bet ----
  SELECT * INTO v_bet FROM bets WHERE id = v_bet_id;

  RETURN row_to_json(v_bet);
END;
$$;

COMMENT ON FUNCTION place_bet IS 'Atomically place a bet: validate, debit, insert bet + transaction';


-- ------------------------------------------------
-- settle_match: resolve all match_winner bets
-- ------------------------------------------------
-- 1. Marks match as finished with winner
-- 2. Deactivates all odds for the match
-- 3. For each pending match_winner bet:
--    - winner bet → status='won', credit potential_gain, insert transaction
--    - loser bet  → status='lost'
-- 4. Returns JSON with counts
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION settle_match(
  p_match_id UUID,
  p_winner   TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match        RECORD;
  v_bet          RECORD;
  v_new_balance  DECIMAL(10,2);
  v_won_count    INT := 0;
  v_lost_count   INT := 0;
BEGIN
  -- ---- Validate winner ----
  IF p_winner NOT IN ('team_a', 'team_b') THEN
    RAISE EXCEPTION 'Gagnant invalide : "%" (attendu "team_a" ou "team_b")', p_winner;
  END IF;

  -- ---- Lock and fetch match ----
  SELECT * INTO v_match
    FROM lol_matches
    WHERE id = p_match_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match introuvable (id: %)', p_match_id;
  END IF;

  IF v_match.winner IS NOT NULL THEN
    RAISE EXCEPTION 'Match déjà résolu (gagnant: %)', v_match.winner;
  END IF;

  IF v_match.status NOT IN ('upcoming', 'live', 'finished') THEN
    RAISE EXCEPTION 'Impossible de résoudre un match avec le statut "%"', v_match.status;
  END IF;

  -- ---- Update match ----
  UPDATE lol_matches
    SET status = 'finished',
        winner = p_winner,
        finished_at = now()
    WHERE id = p_match_id;

  -- ---- Deactivate all odds for this match ----
  UPDATE odds
    SET is_active = false,
        updated_at = now()
    WHERE match_id = p_match_id;

  -- ---- Process all pending bets on match_winner ----
  FOR v_bet IN
    SELECT b.*
      FROM bets b
      JOIN odds o ON b.odd_id = o.id
      WHERE b.match_id = p_match_id
        AND b.status = 'pending'
        AND o.bet_type = 'match_winner'
      FOR UPDATE OF b
  LOOP
    IF (p_winner = 'team_a' AND v_bet.selection = 'a')
       OR (p_winner = 'team_b' AND v_bet.selection = 'b')
    THEN
      -- ---- WON: credit potential_gain ----
      UPDATE bets
        SET status = 'won', settled_at = now()
        WHERE id = v_bet.id;

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
        'Pari gagné : ' || v_match.team_a_name || ' vs ' || v_match.team_b_name
      );

      v_won_count := v_won_count + 1;
    ELSE
      -- ---- LOST ----
      UPDATE bets
        SET status = 'lost', settled_at = now()
        WHERE id = v_bet.id;

      v_lost_count := v_lost_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'match_id',   p_match_id,
    'winner',     p_winner,
    'bets_won',   v_won_count,
    'bets_lost',  v_lost_count,
    'bets_total', v_won_count + v_lost_count
  );
END;
$$;

COMMENT ON FUNCTION settle_match IS 'Atomically settle a match: set winner, resolve all match_winner bets, credit winners';


-- ------------------------------------------------
-- cancel_match: refund all pending bets
-- ------------------------------------------------
-- 1. Marks match as cancelled
-- 2. Deactivates all odds
-- 3. For each pending bet (all types):
--    - status='refunded', credit amount back, insert transaction
-- 4. Returns JSON with refund count
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION cancel_match(
  p_match_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match        RECORD;
  v_bet          RECORD;
  v_new_balance  DECIMAL(10,2);
  v_refund_count INT := 0;
  v_refund_total DECIMAL(10,2) := 0;
BEGIN
  -- ---- Lock and fetch match ----
  SELECT * INTO v_match
    FROM lol_matches
    WHERE id = p_match_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match introuvable (id: %)', p_match_id;
  END IF;

  IF v_match.status = 'cancelled' THEN
    RAISE EXCEPTION 'Match déjà annulé';
  END IF;

  IF v_match.winner IS NOT NULL THEN
    RAISE EXCEPTION 'Impossible d''annuler un match déjà résolu';
  END IF;

  -- ---- Update match ----
  UPDATE lol_matches
    SET status = 'cancelled',
        finished_at = now()
    WHERE id = p_match_id;

  -- ---- Deactivate all odds ----
  UPDATE odds
    SET is_active = false,
        updated_at = now()
    WHERE match_id = p_match_id;

  -- ---- Refund all pending bets (all bet types) ----
  FOR v_bet IN
    SELECT b.*
      FROM bets b
      WHERE b.match_id = p_match_id
        AND b.status = 'pending'
      FOR UPDATE OF b
  LOOP
    -- Mark as refunded
    UPDATE bets
      SET status = 'refunded', settled_at = now()
      WHERE id = v_bet.id;

    -- Credit amount back
    UPDATE profiles
      SET balance = balance + v_bet.amount
      WHERE id = v_bet.user_id
      RETURNING balance INTO v_new_balance;

    -- Insert refund transaction
    INSERT INTO transactions (user_id, type, amount, balance_after, reference, description)
    VALUES (
      v_bet.user_id,
      'bet_refund',
      v_bet.amount,
      v_new_balance,
      v_bet.id::TEXT,
      'Remboursement : ' || v_match.team_a_name || ' vs ' || v_match.team_b_name || ' (match annulé)'
    );

    v_refund_count := v_refund_count + 1;
    v_refund_total := v_refund_total + v_bet.amount;
  END LOOP;

  RETURN json_build_object(
    'match_id',     p_match_id,
    'bets_refunded', v_refund_count,
    'total_refunded', v_refund_total
  );
END;
$$;

COMMENT ON FUNCTION cancel_match IS 'Atomically cancel a match: refund all pending bets';
