-- ============================================
-- BetLoL — 002 Indexes
-- ============================================

-- Matches
CREATE INDEX idx_matches_status    ON lol_matches(status);
CREATE INDEX idx_matches_starts_at ON lol_matches(starts_at);
CREATE INDEX idx_matches_league    ON lol_matches(league);
CREATE INDEX idx_matches_status_starts_at ON lol_matches(status, starts_at);

-- Odds
CREATE INDEX idx_odds_match        ON odds(match_id);
CREATE INDEX idx_odds_match_active ON odds(match_id) WHERE is_active = true;

-- Bets
CREATE INDEX idx_bets_user         ON bets(user_id);
CREATE INDEX idx_bets_match        ON bets(match_id);
CREATE INDEX idx_bets_status       ON bets(status);
CREATE INDEX idx_bets_user_status  ON bets(user_id, status);
CREATE INDEX idx_bets_match_status ON bets(match_id, status) WHERE status = 'pending';

-- Transactions
CREATE INDEX idx_transactions_user          ON transactions(user_id);
CREATE INDEX idx_transactions_user_created  ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_reference     ON transactions(reference) WHERE reference IS NOT NULL;
