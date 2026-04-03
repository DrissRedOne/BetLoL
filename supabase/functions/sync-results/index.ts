/**
 * Supabase Edge Function: sync-results
 *
 * Checks live matches in our DB against PandaScore, and
 * automatically settles those that have finished.
 *
 * Deploy: supabase functions deploy sync-results
 * Cron: every 2 minutes
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PANDASCORE_URL = "https://api.pandascore.co/lol";

Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get("PANDASCORE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "PANDASCORE_API_KEY not set" }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get live matches with external_id from our DB
    const { data: liveMatches } = await supabase
      .from("lol_matches")
      .select("id, external_id")
      .eq("status", "live")
      .not("external_id", "is", null);

    if (!liveMatches || liveMatches.length === 0) {
      return new Response(JSON.stringify({ settled: 0, checked: 0, message: "No live matches" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let settled = 0;
    let checked = 0;

    for (const match of liveMatches) {
      checked++;

      try {
        const res = await fetch(`${PANDASCORE_URL}/matches/${match.external_id}`, {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        });

        if (!res.ok) continue;

        const psMatch = await res.json();

        if (psMatch.status === "finished" && psMatch.winner) {
          const teamA = psMatch.opponents?.[0]?.opponent;
          const winner = psMatch.winner.name === teamA?.name ? "team_a" : "team_b";

          // Call settle_match RPC
          const { error } = await supabase.rpc("settle_match", {
            p_match_id: match.id,
            p_winner: winner,
          });

          if (!error) {
            settled++;
            console.log(`[sync-results] Settled match ${match.id} (${match.external_id}), winner: ${winner}`);
          } else {
            console.error(`[sync-results] Settle failed for ${match.id}:`, error.message);
          }
        }
      } catch (err) {
        console.error(`[sync-results] Error checking match ${match.external_id}:`, err);
      }

      // Simple rate limiting: 200ms between requests
      await new Promise((r) => setTimeout(r, 200));
    }

    const result = {
      checked,
      settled,
      timestamp: new Date().toISOString(),
    };

    console.log("[sync-results]", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[sync-results] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
