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

    // Get live matches from our DB that have external_id
    const { data: liveMatches } = await supabase
      .from("lol_matches")
      .select("id, external_id")
      .eq("status", "live")
      .not("external_id", "is", null);

    if (!liveMatches || liveMatches.length === 0) {
      return NextResponse.json({ checked: 0, settled: 0, message: "No live matches" });
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

          const { error } = await supabase.rpc("settle_match", {
            p_match_id: match.id,
            p_winner: winner,
          });

          if (!error) settled++;
        }
      } catch {
        // Skip individual match errors
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 250));
    }

    return NextResponse.json({ checked, settled, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[sync-results]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
