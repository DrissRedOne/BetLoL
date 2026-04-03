-- ============================================
-- BetLoL — 006 Wallet RPC Functions (V1 simulation)
-- ============================================
-- TODO: Replace with Stripe Checkout webhook handlers in production.

CREATE OR REPLACE FUNCTION simulate_deposit(
  p_user_id UUID,
  p_amount  DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance DECIMAL(10,2);
BEGIN
  IF p_amount < 5 THEN
    RAISE EXCEPTION 'Dépôt minimum : 5€';
  END IF;
  IF p_amount > 10000 THEN
    RAISE EXCEPTION 'Dépôt maximum : 10 000€';
  END IF;

  UPDATE profiles
    SET balance = balance + p_amount
    WHERE id = p_user_id
    RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;

  INSERT INTO transactions (user_id, type, amount, balance_after, description)
  VALUES (
    p_user_id,
    'deposit',
    p_amount,
    v_new_balance,
    'Dépôt de ' || p_amount || '€ (simulation V1)'
  );

  RETURN json_build_object('new_balance', v_new_balance);
END;
$$;

CREATE OR REPLACE FUNCTION simulate_withdrawal(
  p_user_id UUID,
  p_amount  DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance DECIMAL(10,2);
  v_current DECIMAL(10,2);
BEGIN
  IF p_amount < 10 THEN
    RAISE EXCEPTION 'Retrait minimum : 10€';
  END IF;
  IF p_amount > 10000 THEN
    RAISE EXCEPTION 'Retrait maximum : 10 000€';
  END IF;

  SELECT balance INTO v_current
    FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;

  IF v_current < p_amount THEN
    RAISE EXCEPTION 'Solde insuffisant (%€)', v_current;
  END IF;

  v_new_balance := v_current - p_amount;

  UPDATE profiles SET balance = v_new_balance WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, amount, balance_after, description)
  VALUES (
    p_user_id,
    'withdrawal',
    p_amount,
    v_new_balance,
    'Retrait de ' || p_amount || '€ (simulation V1)'
  );

  RETURN json_build_object('new_balance', v_new_balance);
END;
$$;
