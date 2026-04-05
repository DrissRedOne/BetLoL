import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PANDASCORE_URL = "https://api.pandascore.co/lol";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.PANDASCORE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "PANDASCORE_API_KEY not set" }, { status: 500 });
    }

    const supabase = createAdminClient();
    const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };

    // Fetch upcoming + live from PandaScore
    const [upcomingRes, liveRes] = await Promise.all([
      fetch(`${PANDASCORE_URL}/matches/upcoming?sort=begin_at&per_page=30`, { headers }),
      fetch(`${PANDASCORE_URL}/matches/running?per_page=20`, { headers }),
    ]);

    if (!upcomingRes.ok) {
      const body = await upcomingRes.text();
      return NextResponse.json({ error: `PandaScore upcoming: ${upcomingRes.status} ${body.slice(0, 200)}` }, { status: 502 });
    }
    if (!liveRes.ok) {
      const body = await liveRes.text();
      return NextResponse.json({ error: `PandaScore live: ${liveRes.status} ${body.slice(0, 200)}` }, { status: 502 });
    }

    const upcoming = await upcomingRes.json();
    const live = await liveRes.json();
    const allMatches = [...live, ...upcoming];

    let matchesSync = 0;
    let oddsSync = 0;

    for (const m of allMatches) {
      const teamA = m.opponents?.[0]?.opponent;
      const teamB = m.opponents?.[1]?.opponent;
      if (!teamA || !teamB) continue;

      const status =
        m.status === "not_started" ? "upcoming" :
        m.status === "running" ? "live" :
        m.status === "finished" ? "finished" : "cancelled";

      const winner = m.winner
        ? m.winner.name === teamA.name ? "team_a" : "team_b"
        : null;

      // Upsert match
      const { data: match } = await supabase
        .from("lol_matches")
        .upsert(
          {
            external_id: String(m.id),
            league: m.league?.slug?.toLowerCase() ?? "unknown",
            tournament: m.serie?.full_name ?? null,
            team_a_name: teamA.name,
            team_a_logo: teamA.image_url,
            team_b_name: teamB.name,
            team_b_logo: teamB.image_url,
            best_of: m.number_of_games || 1,
            score_a: m.results?.[0]?.score ?? 0,
            score_b: m.results?.[1]?.score ?? 0,
            status,
            starts_at: m.begin_at,
            finished_at: m.end_at ?? null,
            winner,
          },
          { onConflict: "external_id" }
        )
        .select("id")
        .single();

      if (!match) continue;
      matchesSync++;

      // Generate match_winner odds if not finished
      if (status !== "finished" && status !== "cancelled") {
        // Compute pseudo-realistic odds from team name lengths
        const seed = teamA.name.length + teamB.name.length;
        const base = 1.3 + (seed % 7) * 0.1;
        const oddA = Math.max(Math.round((base + 0.05) * 100) / 100, 1.01);
        const oddB = Math.max(Math.round((1 / (1 - 1 / (base + 0.05)) + 0.05) * 100) / 100, 1.01);

        const { error: oddErr } = await supabase.from("odds").upsert(
          {
            match_id: match.id,
            bet_type: "match_winner",
            label_a: teamA.name,
            label_b: teamB.name,
            odd_a: oddA,
            odd_b: oddB,
            is_active: true,
          },
          { onConflict: "match_id,bet_type,map_number" }
        );
        if (!oddErr) oddsSync++;
      }
    }

    return NextResponse.json({
      matches_synced: matchesSync,
      odds_updated: oddsSync,
      total_fetched: allMatches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[sync-matches]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
