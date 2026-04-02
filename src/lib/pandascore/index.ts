import type { LolMatch } from "@/types";

const PANDASCORE_BASE_URL = "https://api.pandascore.co/lol";

interface PandaScoreMatch {
  id: number;
  name: string;
  league: { slug: string; name: string };
  serie: { full_name: string };
  opponents: Array<{
    opponent: { name: string; image_url: string | null };
  }>;
  number_of_games: number;
  results: Array<{ team_id: number; score: number }>;
  status: "not_started" | "running" | "finished" | "canceled";
  begin_at: string;
  end_at: string | null;
  winner: { name: string } | null;
}

async function fetchPandaScore<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${PANDASCORE_BASE_URL}${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.PANDASCORE_API_KEY}`,
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`PandaScore API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function mapStatus(status: PandaScoreMatch["status"]): LolMatch["status"] {
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

function mapMatch(match: PandaScoreMatch): Omit<LolMatch, "id" | "created_at"> {
  const teamA = match.opponents[0]?.opponent;
  const teamB = match.opponents[1]?.opponent;

  return {
    external_id: String(match.id),
    league: match.league.slug.toUpperCase(),
    tournament: match.serie.full_name,
    team_a_name: teamA?.name ?? "TBD",
    team_a_logo: teamA?.image_url ?? null,
    team_b_name: teamB?.name ?? "TBD",
    team_b_logo: teamB?.image_url ?? null,
    best_of: match.number_of_games,
    score_a: match.results[0]?.score ?? 0,
    score_b: match.results[1]?.score ?? 0,
    status: mapStatus(match.status),
    starts_at: match.begin_at,
    finished_at: match.end_at,
    winner: match.winner
      ? match.winner.name === teamA?.name
        ? "team_a"
        : "team_b"
      : null,
  };
}

export async function getUpcomingMatches(page = 1, perPage = 20): Promise<Omit<LolMatch, "id" | "created_at">[]> {
  const matches = await fetchPandaScore<PandaScoreMatch[]>("/matches/upcoming", {
    page: String(page),
    per_page: String(perPage),
    sort: "begin_at",
  });

  return matches.map(mapMatch);
}

export async function getRunningMatches(): Promise<Omit<LolMatch, "id" | "created_at">[]> {
  const matches = await fetchPandaScore<PandaScoreMatch[]>("/matches/running");
  return matches.map(mapMatch);
}

export async function getMatchById(matchId: number): Promise<Omit<LolMatch, "id" | "created_at">> {
  const match = await fetchPandaScore<PandaScoreMatch>(`/matches/${matchId}`);
  return mapMatch(match);
}
