"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LolMatch } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { settleMatch, cancelMatch } from "@/lib/actions/admin";
import { triggerSyncResults } from "@/lib/actions/sync";
import { formatAmount } from "@/lib/utils";
import { ChevronLeft, Trophy, Ban, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

function AdminResultatsClient({ matches }: { matches: LolMatch[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [settleTarget, setSettleTarget] = useState<LolMatch | null>(null);
  const [settleResult, setSettleResult] = useState<{
    betsWon: number;
    betsLost: number;
    betsTotal: number;
  } | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Déclarer les résultats
        </h1>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={async () => {
            const res = await triggerSyncResults();
            if (res.success) {
              const d = res.data as Record<string, number>;
              toast(`Vérifié: ${d.checked} matchs, ${d.settled} résolus`, "success");
              router.refresh();
            } else {
              toast(res.error ?? "Erreur", "error");
            }
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Vérifier via PandaScore
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-[var(--accent-green)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">Aucun match en attente de résultat</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="league">{match.league}</Badge>
                <Badge variant={match.status === "live" ? "live" : "upcoming"}>
                  {match.status === "live" ? "EN DIRECT" : "À venir"}
                </Badge>
                {match.tournament && (
                  <span className="text-xs text-[var(--text-muted)]">{match.tournament}</span>
                )}
                <span className="text-xs text-[var(--text-muted)] ml-auto">
                  BO{match.best_of}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold">{match.team_a_name}</span>
                <span className="font-[family-name:var(--font-mono)] text-lg text-[var(--text-muted)]">
                  {match.score_a} — {match.score_b}
                </span>
                <span className="text-base font-semibold">{match.team_b_name}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSettleTarget(match)}
                >
                  <Trophy className="h-4 w-4" />
                  Déclarer résultat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const result = await cancelMatch(match.id);
                    if (result.success) {
                      toast(
                        `Match annulé. ${result.betsRefunded} pari(s) remboursé(s) (${formatAmount(result.totalRefunded ?? 0)})`,
                        "info"
                      );
                      router.refresh();
                    } else {
                      toast(result.error ?? "Erreur", "error");
                    }
                  }}
                >
                  <Ban className="h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Settle modal */}
      {settleTarget && (
        <SettleModal
          match={settleTarget}
          onClose={() => {
            setSettleTarget(null);
            setSettleResult(null);
          }}
          onSettled={(result) => {
            setSettleResult(result);
            router.refresh();
          }}
          result={settleResult}
        />
      )}
    </div>
  );
}

function SettleModal({
  match,
  onClose,
  onSettled,
  result,
}: {
  match: LolMatch;
  onClose: () => void;
  onSettled: (result: { betsWon: number; betsLost: number; betsTotal: number }) => void;
  result: { betsWon: number; betsLost: number; betsTotal: number } | null;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSettle(winner: "team_a" | "team_b") {
    setLoading(true);
    const res = await settleMatch(match.id, winner);
    if (res.success) {
      toast(
        `${winner === "team_a" ? match.team_a_name : match.team_b_name} déclaré vainqueur !`,
        "success"
      );
      onSettled({
        betsWon: res.betsWon ?? 0,
        betsLost: res.betsLost ?? 0,
        betsTotal: res.betsTotal ?? 0,
      });
    } else {
      toast(res.error ?? "Erreur", "error");
    }
    setLoading(false);
  }

  return (
    <Modal open onClose={onClose} title="Déclarer le résultat">
      {result ? (
        <div className="text-center py-4 space-y-4">
          <CheckCircle className="h-12 w-12 text-[var(--accent-green)] mx-auto" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Match résolu</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
                {result.betsWon}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Gagnants</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-red)]">
                {result.betsLost}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Perdants</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">
                {result.betsTotal}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
          </div>
          <Button onClick={onClose} className="w-full">Fermer</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            {match.team_a_name} vs {match.team_b_name}
          </p>
          <p className="text-sm text-[var(--text-primary)]">
            Qui a gagné ce match ?
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleSettle("team_a")}
              loading={loading}
            >
              {match.team_a_name}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleSettle("team_b")}
              loading={loading}
            >
              {match.team_b_name}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onClose}
          >
            Annuler
          </Button>
        </div>
      )}
    </Modal>
  );
}

export { AdminResultatsClient };
