/**
 * BetLoL — Seed script
 *
 * Inserts realistic test data into Supabase.
 * Run with: npx tsx supabase/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * in .env.local (or environment variables).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env ───────────────────────────────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local not found, rely on process.env
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`  → ${msg}`);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function uuid(): string {
  return crypto.randomUUID();
}

// ── Data ───────────────────────────────────────────────────────

const MATCHES: Array<{
  id: string;
  league: string;
  tournament: string;
  team_a_name: string;
  team_b_name: string;
  best_of: number;
  status: string;
  starts_at: string;
  score_a: number;
  score_b: number;
  winner: string | null;
  finished_at: string | null;
}> = [
  // ── 5 upcoming ──
  { id: uuid(), league: "lec", tournament: "Summer Split 2025", team_a_name: "G2 Esports", team_b_name: "Fnatic", best_of: 1, status: "upcoming", starts_at: daysFromNow(1), score_a: 0, score_b: 0, winner: null, finished_at: null },
  { id: uuid(), league: "lck", tournament: "Summer 2025", team_a_name: "T1", team_b_name: "Gen.G", best_of: 3, status: "upcoming", starts_at: daysFromNow(2), score_a: 0, score_b: 0, winner: null, finished_at: null },
  { id: uuid(), league: "lpl", tournament: "Summer 2025", team_a_name: "BLG", team_b_name: "JDG", best_of: 3, status: "upcoming", starts_at: daysFromNow(3), score_a: 0, score_b: 0, winner: null, finished_at: null },
  { id: uuid(), league: "lec", tournament: "Summer Split 2025", team_a_name: "Team Vitality", team_b_name: "MAD Lions", best_of: 1, status: "upcoming", starts_at: daysFromNow(5), score_a: 0, score_b: 0, winner: null, finished_at: null },
  { id: uuid(), league: "lck", tournament: "Summer 2025 Playoffs", team_a_name: "Hanwha Life", team_b_name: "DRX", best_of: 5, status: "upcoming", starts_at: daysFromNow(7), score_a: 0, score_b: 0, winner: null, finished_at: null },

  // ── 3 live ──
  { id: uuid(), league: "lck", tournament: "Summer 2025", team_a_name: "T1", team_b_name: "KT Rolster", best_of: 3, status: "live", starts_at: minutesAgo(30), score_a: 1, score_b: 0, winner: null, finished_at: null },
  { id: uuid(), league: "lpl", tournament: "Summer 2025", team_a_name: "Weibo Gaming", team_b_name: "Top Esports", best_of: 3, status: "live", starts_at: minutesAgo(45), score_a: 1, score_b: 1, winner: null, finished_at: null },
  { id: uuid(), league: "lec", tournament: "Summer Split 2025", team_a_name: "SK Gaming", team_b_name: "G2 Esports", best_of: 1, status: "live", starts_at: minutesAgo(20), score_a: 0, score_b: 0, winner: null, finished_at: null },

  // ── 7 finished ──
  { id: uuid(), league: "lec", tournament: "Spring Split 2025", team_a_name: "G2 Esports", team_b_name: "Fnatic", best_of: 5, status: "finished", starts_at: hoursAgo(48), score_a: 3, score_b: 2, winner: "team_a", finished_at: hoursAgo(44) },
  { id: uuid(), league: "lck", tournament: "Spring 2025", team_a_name: "T1", team_b_name: "Gen.G", best_of: 3, status: "finished", starts_at: hoursAgo(72), score_a: 2, score_b: 1, winner: "team_a", finished_at: hoursAgo(69) },
  { id: uuid(), league: "lpl", tournament: "Spring 2025", team_a_name: "JDG", team_b_name: "BLG", best_of: 3, status: "finished", starts_at: hoursAgo(96), score_a: 0, score_b: 2, winner: "team_b", finished_at: hoursAgo(94) },
  { id: uuid(), league: "lck", tournament: "Spring 2025", team_a_name: "DRX", team_b_name: "Hanwha Life", best_of: 1, status: "finished", starts_at: hoursAgo(120), score_a: 0, score_b: 1, winner: "team_b", finished_at: hoursAgo(119) },
  { id: uuid(), league: "lpl", tournament: "Spring 2025", team_a_name: "Top Esports", team_b_name: "LNG", best_of: 3, status: "finished", starts_at: hoursAgo(144), score_a: 2, score_b: 0, winner: "team_a", finished_at: hoursAgo(141) },
  { id: uuid(), league: "lec", tournament: "Spring Split 2025", team_a_name: "MAD Lions", team_b_name: "SK Gaming", best_of: 1, status: "finished", starts_at: hoursAgo(168), score_a: 1, score_b: 0, winner: "team_a", finished_at: hoursAgo(167) },
  { id: uuid(), league: "lck", tournament: "Spring 2025", team_a_name: "KT Rolster", team_b_name: "T1", best_of: 3, status: "finished", starts_at: hoursAgo(192), score_a: 1, score_b: 2, winner: "team_b", finished_at: hoursAgo(189) },
];

const finishedMatches = MATCHES.filter((m) => m.status === "finished");
const liveMatches = MATCHES.filter((m) => m.status === "live");
const upcomingMatches = MATCHES.filter((m) => m.status === "upcoming");

// Odds — generate for all matches
function generateOdds() {
  const odds: Array<{
    id: string;
    match_id: string;
    bet_type: string;
    label_a: string;
    label_b: string;
    odd_a: number;
    odd_b: number;
    map_number: number | null;
    is_active: boolean;
  }> = [];

  for (const match of MATCHES) {
    const isFinished = match.status === "finished";

    // match_winner on all
    odds.push({
      id: uuid(),
      match_id: match.id,
      bet_type: "match_winner",
      label_a: match.team_a_name,
      label_b: match.team_b_name,
      odd_a: +(1.25 + Math.random() * 0.4).toFixed(2),
      odd_b: +(2.10 + Math.random() * 1.4).toFixed(2),
      map_number: null,
      is_active: !isFinished,
    });

    // first_blood on live + upcoming
    if (match.status !== "finished") {
      odds.push({
        id: uuid(),
        match_id: match.id,
        bet_type: "first_blood",
        label_a: match.team_a_name,
        label_b: match.team_b_name,
        odd_a: +(1.75 + Math.random() * 0.3).toFixed(2),
        odd_b: +(1.75 + Math.random() * 0.3).toFixed(2),
        map_number: null,
        is_active: true,
      });
    }

    // total_kills on live matches
    if (match.status === "live") {
      odds.push({
        id: uuid(),
        match_id: match.id,
        bet_type: "total_kills_over_under",
        label_a: "Over 25.5",
        label_b: "Under 25.5",
        odd_a: +(1.85 + Math.random() * 0.1).toFixed(2),
        odd_b: +(1.85 + Math.random() * 0.1).toFixed(2),
        map_number: null,
        is_active: true,
      });
    }

    // first_dragon on 5 upcoming
    if (match.status === "upcoming" && upcomingMatches.indexOf(match) < 5) {
      odds.push({
        id: uuid(),
        match_id: match.id,
        bet_type: "first_dragon",
        label_a: match.team_a_name,
        label_b: match.team_b_name,
        odd_a: +(1.70 + Math.random() * 0.45).toFixed(2),
        odd_b: +(1.70 + Math.random() * 0.45).toFixed(2),
        map_number: null,
        is_active: true,
      });
    }
  }

  return odds;
}

const ALL_ODDS = generateOdds();

// ── Users ──────────────────────────────────────────────────────

const ADMIN_EMAIL = "admin@betlol.dev";
const ADMIN_PASSWORD = "Admin123!";
const TEST_EMAIL = "test@betlol.dev";
const TEST_PASSWORD = "Test123!";

// ── Main ───────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱 BetLoL — Seed\n");

  // ── Clean ──
  console.log("🧹 Cleaning tables...");
  await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("bets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("odds").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("lol_matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  // profiles + auth users cleaned via cascade
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  for (const u of existingUsers?.users ?? []) {
    await supabase.auth.admin.deleteUser(u.id);
  }
  log("Tables cleaned");

  // ── Matches ──
  console.log("\n⚔️  Inserting matches...");
  const { error: matchErr } = await supabase.from("lol_matches").insert(MATCHES);
  if (matchErr) throw new Error(`Match insert failed: ${matchErr.message}`);
  log(`${MATCHES.length} matches inserted`);

  // ── Odds ──
  console.log("\n📊 Inserting odds...");
  const { error: oddErr } = await supabase.from("odds").insert(ALL_ODDS);
  if (oddErr) throw new Error(`Odds insert failed: ${oddErr.message}`);
  log(`${ALL_ODDS.length} odds inserted`);

  // ── Users ──
  console.log("\n👤 Creating users...");

  const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { username: "admin" },
  });
  if (adminErr) throw new Error(`Admin create failed: ${adminErr.message}`);
  const adminId = adminData.user.id;
  // Set admin role
  await supabase.from("profiles").update({ role: "admin" }).eq("id", adminId);
  log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  const { data: testData, error: testErr } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { username: "testeur" },
  });
  if (testErr) throw new Error(`Test user create failed: ${testErr.message}`);
  const testId = testData.user.id;
  log(`User: ${TEST_EMAIL} / ${TEST_PASSWORD}`);

  // ── Bets & Transactions ──
  console.log("\n🎰 Inserting bets & transactions...");

  // We'll track balance to keep it consistent
  let balance = 0;
  const transactions: Array<{
    user_id: string;
    type: string;
    amount: number;
    balance_after: number;
    reference: string | null;
    description: string;
  }> = [];

  // Initial deposit
  balance = 200;
  transactions.push({
    user_id: testId,
    type: "deposit",
    amount: 200,
    balance_after: balance,
    reference: null,
    description: "Dépôt initial",
  });

  // Find match_winner odds for finished matches
  const finishedOdds = ALL_ODDS.filter(
    (o) =>
      o.bet_type === "match_winner" &&
      finishedMatches.some((m) => m.id === o.match_id)
  );

  // 3 won bets
  const wonAmounts = [10, 25, 50];
  const bets: Array<{
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
  }> = [];

  for (let i = 0; i < 3; i++) {
    const odd = finishedOdds[i];
    const match = finishedMatches[i];
    const betId = uuid();
    const amount = wonAmounts[i];
    // Pick winning selection
    const selection = match.winner === "team_a" ? "a" : "b";
    const lockedOdd = selection === "a" ? odd.odd_a : odd.odd_b;
    const gain = Math.round(amount * lockedOdd * 100) / 100;

    balance -= amount;
    transactions.push({
      user_id: testId,
      type: "bet_placed",
      amount,
      balance_after: balance,
      reference: betId,
      description: `Pari: ${match.team_a_name} vs ${match.team_b_name}`,
    });

    balance += gain;
    transactions.push({
      user_id: testId,
      type: "bet_won",
      amount: gain,
      balance_after: balance,
      reference: betId,
      description: "Pari gagné",
    });

    bets.push({
      id: betId,
      user_id: testId,
      match_id: match.id,
      odd_id: odd.id,
      selection,
      amount,
      locked_odd: lockedOdd,
      potential_gain: gain,
      status: "won",
      settled_at: match.finished_at,
      created_at: match.starts_at,
    });
  }

  // 2 lost bets
  const lostAmounts = [15, 30];
  for (let i = 0; i < 2; i++) {
    const odd = finishedOdds[3 + i];
    const match = finishedMatches[3 + i];
    const betId = uuid();
    const amount = lostAmounts[i];
    // Pick losing selection
    const selection = match.winner === "team_a" ? "b" : "a";
    const lockedOdd = selection === "a" ? odd.odd_a : odd.odd_b;
    const gain = Math.round(amount * lockedOdd * 100) / 100;

    balance -= amount;
    transactions.push({
      user_id: testId,
      type: "bet_placed",
      amount,
      balance_after: balance,
      reference: betId,
      description: `Pari: ${match.team_a_name} vs ${match.team_b_name}`,
    });

    bets.push({
      id: betId,
      user_id: testId,
      match_id: match.id,
      odd_id: odd.id,
      selection,
      amount,
      locked_odd: lockedOdd,
      potential_gain: gain,
      status: "lost",
      settled_at: match.finished_at,
      created_at: match.starts_at,
    });
  }

  // 2 pending on upcoming
  const upcomingOdds = ALL_ODDS.filter(
    (o) =>
      o.bet_type === "match_winner" &&
      upcomingMatches.some((m) => m.id === o.match_id)
  );
  const pendingAmounts = [20, 10];
  for (let i = 0; i < 2; i++) {
    const odd = upcomingOdds[i];
    const match = upcomingMatches[i];
    const betId = uuid();
    const amount = pendingAmounts[i];
    const selection = "a";
    const lockedOdd = odd.odd_a;
    const gain = Math.round(amount * lockedOdd * 100) / 100;

    balance -= amount;
    transactions.push({
      user_id: testId,
      type: "bet_placed",
      amount,
      balance_after: balance,
      reference: betId,
      description: `Pari: ${match.team_a_name} vs ${match.team_b_name}`,
    });

    bets.push({
      id: betId,
      user_id: testId,
      match_id: match.id,
      odd_id: odd.id,
      selection,
      amount,
      locked_odd: lockedOdd,
      potential_gain: gain,
      status: "pending",
      settled_at: null,
      created_at: new Date().toISOString(),
    });
  }

  // 1 pending on live
  {
    const liveOdds = ALL_ODDS.filter(
      (o) =>
        o.bet_type === "match_winner" &&
        liveMatches.some((m) => m.id === o.match_id)
    );
    const odd = liveOdds[0];
    const match = liveMatches[0];
    const betId = uuid();
    const amount = 15;
    const selection = "b" as const;
    const lockedOdd = odd.odd_b;
    const gain = Math.round(amount * lockedOdd * 100) / 100;

    balance -= amount;
    transactions.push({
      user_id: testId,
      type: "bet_placed",
      amount,
      balance_after: balance,
      reference: betId,
      description: `Pari: ${match.team_a_name} vs ${match.team_b_name}`,
    });

    bets.push({
      id: betId,
      user_id: testId,
      match_id: match.id,
      odd_id: odd.id,
      selection,
      amount,
      locked_odd: lockedOdd,
      potential_gain: gain,
      status: "pending",
      settled_at: null,
      created_at: minutesAgo(10),
    });
  }

  // Set final balance
  await supabase.from("profiles").update({
    balance,
    kyc_status: "verified",
  }).eq("id", testId);
  log(`Test user balance: ${balance.toFixed(2)}€`);

  // Insert bets
  const { error: betErr } = await supabase.from("bets").insert(bets);
  if (betErr) throw new Error(`Bets insert failed: ${betErr.message}`);
  log(`${bets.length} bets inserted (3 won, 2 lost, 3 pending)`);

  // Insert transactions
  const { error: txErr } = await supabase.from("transactions").insert(transactions);
  if (txErr) throw new Error(`Transactions insert failed: ${txErr.message}`);
  log(`${transactions.length} transactions inserted`);

  // ── Summary ──
  console.log("\n✅ Seed complete!\n");
  console.log("  📊 Summary:");
  console.log(`     Matches:      ${MATCHES.length} (${upcomingMatches.length} upcoming, ${liveMatches.length} live, ${finishedMatches.length} finished)`);
  console.log(`     Odds:         ${ALL_ODDS.length}`);
  console.log(`     Bets:         ${bets.length}`);
  console.log(`     Transactions: ${transactions.length}`);
  console.log(`     Test balance: ${balance.toFixed(2)}€`);
  console.log(`\n  🔑 Accounts:`);
  console.log(`     Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`     User:  ${TEST_EMAIL} / ${TEST_PASSWORD}\n`);
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
