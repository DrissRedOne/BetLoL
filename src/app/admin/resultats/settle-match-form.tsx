"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface SettleMatchFormProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
}

function SettleMatchForm({ matchId, teamAName, teamBName }: SettleMatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSettle(winner: "team_a" | "team_b") {
    setLoading(true);
    setResult(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("settle_match", {
      p_match_id: matchId,
      p_winner: winner,
    });

    if (error) {
      setResult(`Erreur : ${error.message}`);
    } else {
      setResult(`Match résolu. ${data} pari(s) traité(s).`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSettle("team_a")}
          loading={loading}
          className="flex-1"
        >
          {teamAName} gagne
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSettle("team_b")}
          loading={loading}
          className="flex-1"
        >
          {teamBName} gagne
        </Button>
      </div>
      {result && (
        <p className={`mt-2 text-xs ${result.startsWith("Erreur") ? "text-[#FF4655]" : "text-[#00FF87]"}`}>
          {result}
        </p>
      )}
    </div>
  );
}

export { SettleMatchForm };
