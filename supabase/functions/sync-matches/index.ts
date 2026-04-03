/**
 * Supabase Edge Function: sync-matches
 *
 * Fetches upcoming and live LoL matches from PandaScore,
 * upserts them into lol_matches, and generates odds.
 *
 * Deploy: supabase functions deploy sync-matches
 * Cron: every 5 minutes
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PANDASCORE_URL = "https://api.pandascore.co/lol";

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get("PANDASCORE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "PANDASCORE_API_KEY not set" }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    };

    // Fetch upcoming + live
    const [upcomingRes, liveRes] = await Promise.all([
      fetch(`${PANDASCORE_URL}/matches/upcoming?sort=begin_at&per_page=50`, { headers }),
      fetch(`${PANDASCORE_URL}/matches/running?per_page=20`, { headers }),
    ]);

    if (!upcomingRes.ok || !liveRes.ok) {
      return new Response(JSON.stringify({ error: "PandaScore API error" }), { status: 502 });
    }

    const upcoming = await upcomingRes.json();
    const live = await liveRes.json();
    const allMatches = [...upcoming, ...live];

    let matchesSync = 0;
    let oddsSync = 0;

    for (const m of allMatches) {
      const teamA = m.opponents?.[0]?.opponent;
      const teamB = m.opponents?.[1]?.opponent;
      if (!teamA || !teamB) continue;

      const status = m.status === "not_started" ? "upcoming" : m.status === "running" ? "live" : m.status === "finished" ? "finished" : "cancelled";

      // Upsert match
      const { data: match, error } = await supabase
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
            finished_at: m.end_at,
            winner: m.winner ? (m.winner.name === teamA.name ? "team_a" : "team_b") : null,
          },
          { onConflict: "external_id" }
        )
        .select("id")
        .single();

      if (error || !match) continue;
      matchesSync++;

      // Generate match_winner odds if not finished
      if (status !== "finished" && status !== "cancelled") {
        const nameLen = teamA.name.length + teamB.name.length;
        const base = 1.3 + (nameLen % 7) * 0.1;
        const oddA = Math.round((base + 0.05) * 100) / 100;
        const oddB = Math.round((1 / (1 - 1 / (base + 0.05)) + 0.05) * 100) / 100;

        await supabase.from("odds").upsert(
          {
            match_id: match.id,
            bet_type: "match_winner",
            label_a: teamA.name,
            label_b: teamB.name,
            odd_a: Math.max(oddA, 1.01),
            odd_b: Math.max(oddB, 1.01),
            is_active: true,
          },
          { onConflict: "match_id,bet_type,map_number" }
        );
        oddsSync++;
      }
    }

    // Mark finished matches from PandaScore
    let finishedCount = 0;
    for (const m of allMatches) {
      if (m.status === "finished" && m.winner) {
        const teamA = m.opponents?.[0]?.opponent;
        const winner = m.winner.name === teamA?.name ? "team_a" : "team_b";

        const { data: existing } = await supabase
          .from("lol_matches")
          .select("id, winner")
          .eq("external_id", String(m.id))
          .single();

        if (existing && !existing.winner) {
          await supabase.from("lol_matches").update({
            status: "finished",
            winner,
            finished_at: m.end_at ?? new Date().toISOString(),
          }).eq("id", existing.id);

          // Deactivate odds
          await supabase.from("odds").update({ is_active: false }).eq("match_id", existing.id);
          finishedCount++;
        }
      }
    }

    const result = {
      matches_synced: matchesSync,
      odds_updated: oddsSync,
      matches_finished: finishedCount,
      timestamp: new Date().toISOString(),
    };

    console.log("[sync-matches]", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[sync-matches] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
