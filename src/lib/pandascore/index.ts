/**
 * PandaScore API wrapper for LoL matches and odds.
 * Server-side only — never import this in client components.
 */

import type { LolMatch } from "@/types";

const BASE_URL = "https://api.pandascore.co/lol";

// ── Types ──────────────────────────────────────────────────────

export interface PandaScoreMatch {
  id: number;
  name: string;
  league: { id: number; slug: string; name: string };
  serie: { full_name: string; slug: string };
  tournament: { name: string } | null;
  opponents: Array<{
    opponent: { id: number; name: string; image_url: string | null };
  }>;
  number_of_games: number;
  results: Array<{ team_id: number; score: number }>;
  status: "not_started" | "running" | "finished" | "canceled";
  begin_at: string;
  end_at: string | null;
  winner: { id: number; name: string } | null;
  games: Array<{
    id: number;
    status: string;
    winner: { id: number; name: string } | null;
  }> | null;
}

export interface PandaScoreOdd {
  id: number;
  match_id: number;
  bookmaker: { name: string };
  odds: Array<{
    label: string;
    value: number;
    selection: string;
  }>;
}

interface RateLimitState {
  remaining: number;
  resetAt: number;
}

// ── Rate limiting ──────────────────────────────────────────────

let rateLimit: RateLimitState = { remaining: 60, resetAt: 0 };

function updateRateLimit(headers: Headers) {
  const remaining = headers.get("x-rate-limit-remaining");
  const reset = headers.get("x-rate-limit-reset");
  if (remaining) rateLimit.remaining = parseInt(remaining, 10);
  if (reset) rateLimit.resetAt = parseInt(reset, 10) * 1000;
}

async function waitForRateLimit() {
  if (rateLimit.remaining <= 1 && Date.now() < rateLimit.resetAt) {
    const waitMs = rateLimit.resetAt - Date.now() + 100;
    console.log(`[PandaScore] Rate limited, waiting ${waitMs}ms`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

// ── Fetch helper ───────────────────────────────────────────────

async function fetchPandaScore<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  await waitForRateLimit();

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const apiKey = process.env.PANDASCORE_API_KEY;
  if (!apiKey) {
    throw new Error("PANDASCORE_API_KEY is not configured");
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  updateRateLimit(response.headers);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `PandaScore ${response.status}: ${response.statusText} — ${body.slice(0, 200)}`
    );
  }

  return response.json() as Promise<T>;
}

// ── Mappers ────────────────────────────────────────────────────

function mapStatus(
  status: PandaScoreMatch["status"]
): LolMatch["status"] {
  switch (status) {
    case "not_started":
      return "upcoming";
    case "running":
      return "live";
    case "finished":
      return "finished";
    case "canceled":
      return "cancelled";
  }
}

export function mapMatch(
  match: PandaScoreMatch
): Omit<LolMatch, "id" | "created_at"> {
  const teamA = match.opponents[0]?.opponent;
  const teamB = match.opponents[1]?.opponent;

  return {
    external_id: String(match.id),
    league: match.league.slug.toLowerCase(),
    tournament: match.serie.full_name ?? null,
    team_a_name: teamA?.name ?? "TBD",
    team_a_logo: teamA?.image_url ?? null,
    team_b_name: teamB?.name ?? "TBD",
    team_b_logo: teamB?.image_url ?? null,
    best_of: match.number_of_games || 1,
    score_a: match.results[0]?.score ?? 0,
    score_b: match.results[1]?.score ?? 0,
    status: mapStatus(match.status),
    starts_at: match.begin_at,
    finished_at: match.end_at ?? null,
    winner: match.winner
      ? match.winner.name === teamA?.name
        ? "team_a"
        : "team_b"
      : null,
  };
}

// ── Public API ─────────────────────────────────────────────────

export async function fetchUpcomingMatches(
  perPage = 50
): Promise<PandaScoreMatch[]> {
  return fetchPandaScore<PandaScoreMatch[]>("/matches/upcoming", {
    sort: "begin_at",
    per_page: String(perPage),
    "filter[videogame]": "lol",
  });
}

export async function fetchLiveMatches(): Promise<PandaScoreMatch[]> {
  return fetchPandaScore<PandaScoreMatch[]>("/matches/running", {
    per_page: "20",
    "filter[videogame]": "lol",
  });
}

export async function fetchMatchById(
  matchId: number
): Promise<PandaScoreMatch> {
  return fetchPandaScore<PandaScoreMatch>(`/matches/${matchId}`);
}

export async function fetchMatchOdds(
  matchId: number
): Promise<PandaScoreOdd[]> {
  try {
    return await fetchPandaScore<PandaScoreOdd[]>(
      `/matches/${matchId}/odds`
    );
  } catch {
    // Odds endpoint may not be available for all matches
    return [];
  }
}

/**
 * Generate synthetic odds from a PandaScore match when real
 * bookmaker odds aren't available (common for esports).
 */
export function generateSyntheticOdds(match: PandaScoreMatch): {
  odd_a: number;
  odd_b: number;
} {
  // Simple model: use name-based seeding for consistent but varied odds
  const seed =
    (match.opponents[0]?.opponent.name ?? "").length +
    (match.opponents[1]?.opponent.name ?? "").length;
  const base = 1.3 + (seed % 7) * 0.1;
  const margin = 0.05;
  return {
    odd_a: Math.round((base + margin) * 100) / 100,
    odd_b: Math.round((1 / (1 - 1 / (base + margin)) + margin) * 100) / 100,
  };
}
