"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LolMatch, MatchStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createMatch, updateMatch, upsertOdd, type CreateMatchInput, type UpsertOddInput } from "@/lib/actions/admin";
import { LOL_LEAGUES, BET_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trophy, ChevronLeft } from "lucide-react";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  upcoming: "À venir",
  live: "En direct",
  finished: "Terminé",
  cancelled: "Annulé",
};

function AdminMatchsClient({ matches: initialMatches }: { matches: LolMatch[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [filterLeague, setFilterLeague] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<MatchStatus | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<LolMatch | null>(null);
  const [oddsMatch, setOddsMatch] = useState<LolMatch | null>(null);

  const filtered = initialMatches.filter((m) => {
    if (filterLeague && m.league.toLowerCase() !== filterLeague) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Gestion des matchs
          </h1>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          Ajouter un match
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={filterLeague ?? ""}
          onChange={(e) => setFilterLeague(e.target.value || null)}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
        >
          <option value="">Toutes les ligues</option>
          {LOL_LEAGUES.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select
          value={filterStatus ?? ""}
          onChange={(e) => setFilterStatus((e.target.value || null) as MatchStatus | null)}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
        >
          <option value="">Tous les statuts</option>
          <option value="upcoming">À venir</option>
          <option value="live">En direct</option>
          <option value="finished">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>

        <span className="text-xs text-[var(--text-muted)] self-center ml-2">
          {filtered.length} match{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Match table */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-[var(--text-muted)] py-8">Aucun match</p>
          </Card>
        ) : (
          filtered.map((match) => (
            <Card key={match.id}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="league">{match.league}</Badge>
                  <Badge variant={match.status === "live" ? "live" : match.status === "upcoming" ? "upcoming" : match.status === "finished" ? "finished" : "cancelled"}>
                    {statusLabels[match.status]}
                  </Badge>
                  <span className="text-sm font-medium truncate">
                    {match.team_a_name} vs {match.team_b_name}
                  </span>
                  {match.status !== "upcoming" && (
                    <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
                      {match.score_a} - {match.score_b}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[var(--text-muted)] hidden sm:block">
                    {formatDate(match.starts_at)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOddsMatch(match)}
                    className="rounded-md p-1.5 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors cursor-pointer"
                    title="Gérer les cotes"
                  >
                    <Trophy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMatch(match)}
                    className="rounded-md p-1.5 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create modal */}
      <CreateMatchModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          toast("Match créé", "success");
          setCreateOpen(false);
          router.refresh();
        }}
      />

      {/* Edit modal */}
      {editMatch && (
        <EditMatchModal
          match={editMatch}
          onClose={() => setEditMatch(null)}
          onUpdated={() => {
            toast("Match mis à jour", "success");
            setEditMatch(null);
            router.refresh();
          }}
        />
      )}

      {/* Odds modal */}
      {oddsMatch && (
        <OddsModal
          match={oddsMatch}
          onClose={() => setOddsMatch(null)}
        />
      )}
    </div>
  );
}

// ── Create Match Modal ─────────────────────────────────────────

function CreateMatchModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const input: CreateMatchInput = {
      league: fd.get("league") as string,
      tournament: fd.get("tournament") as string,
      team_a_name: fd.get("team_a_name") as string,
      team_a_logo: fd.get("team_a_logo") as string,
      team_b_name: fd.get("team_b_name") as string,
      team_b_logo: fd.get("team_b_logo") as string,
      best_of: Number(fd.get("best_of")),
      starts_at: fd.get("starts_at") as string,
    };

    const result = await createMatch(input);
    if (result.success) {
      onCreated();
    } else {
      toast(result.error ?? "Erreur", "error");
    }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un match" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input id="team_a_name" name="team_a_name" label="Équipe A" required />
          <Input id="team_b_name" name="team_b_name" label="Équipe B" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="team_a_logo" name="team_a_logo" label="Logo A (URL)" placeholder="https://..." />
          <Input id="team_b_logo" name="team_b_logo" label="Logo B (URL)" placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="league" className="block text-sm font-medium text-[var(--text-primary)]">Ligue</label>
            <select
              id="league"
              name="league"
              required
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {LOL_LEAGUES.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="best_of" className="block text-sm font-medium text-[var(--text-primary)]">Format</label>
            <select
              id="best_of"
              name="best_of"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="1">BO1</option>
              <option value="3">BO3</option>
              <option value="5">BO5</option>
            </select>
          </div>
        </div>
        <Input id="tournament" name="tournament" label="Tournoi" placeholder="Spring Split 2025" />
        <Input id="starts_at" name="starts_at" label="Date & heure" type="datetime-local" required />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button type="submit" className="flex-1" loading={loading}>Créer</Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Match Modal ───────────────────────────────────────────

function EditMatchModal({
  match,
  onClose,
  onUpdated,
}: {
  match: LolMatch;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await updateMatch({
      id: match.id,
      team_a_name: fd.get("team_a_name") as string,
      team_b_name: fd.get("team_b_name") as string,
      league: fd.get("league") as string,
      status: fd.get("status") as string,
      score_a: Number(fd.get("score_a")),
      score_b: Number(fd.get("score_b")),
      best_of: Number(fd.get("best_of")),
    });

    if (result.success) {
      onUpdated();
    } else {
      toast(result.error ?? "Erreur", "error");
    }
    setLoading(false);
  }

  return (
    <Modal open onClose={onClose} title="Modifier le match" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input id="team_a_name" name="team_a_name" label="Équipe A" defaultValue={match.team_a_name} required />
          <Input id="team_b_name" name="team_b_name" label="Équipe B" defaultValue={match.team_b_name} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="score_a" name="score_a" label="Score A" type="number" defaultValue={match.score_a} min={0} />
          <Input id="score_b" name="score_b" label="Score B" type="number" defaultValue={match.score_b} min={0} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="league-edit" className="block text-sm font-medium text-[var(--text-primary)]">Ligue</label>
            <select
              id="league-edit"
              name="league"
              defaultValue={match.league.toLowerCase()}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {LOL_LEAGUES.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status-edit" className="block text-sm font-medium text-[var(--text-primary)]">Statut</label>
            <select
              id="status-edit"
              name="status"
              defaultValue={match.status}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="upcoming">À venir</option>
              <option value="live">En direct</option>
              <option value="finished">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="best_of-edit" className="block text-sm font-medium text-[var(--text-primary)]">Format</label>
          <select
            id="best_of-edit"
            name="best_of"
            defaultValue={match.best_of}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="1">BO1</option>
            <option value="3">BO3</option>
            <option value="5">BO5</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button type="submit" className="flex-1" loading={loading}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Odds Modal ─────────────────────────────────────────────────

function OddsModal({
  match,
  onClose,
}: {
  match: LolMatch;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [betType, setBetType] = useState("match_winner");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const input: UpsertOddInput = {
      match_id: match.id,
      bet_type: betType,
      label_a: (fd.get("label_a") as string) || match.team_a_name,
      label_b: (fd.get("label_b") as string) || match.team_b_name,
      odd_a: Number(fd.get("odd_a")),
      odd_b: Number(fd.get("odd_b")),
      map_number: betType === "map_winner" ? Number(fd.get("map_number")) : null,
    };

    const result = await upsertOdd(input);
    if (result.success) {
      toast("Cotes mises à jour", "success");
      (e.target as HTMLFormElement).reset();
    } else {
      toast(result.error ?? "Erreur", "error");
    }
    setLoading(false);
  }

  return (
    <Modal open onClose={onClose} title={`Cotes — ${match.team_a_name} vs ${match.team_b_name}`} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="bet_type" className="block text-sm font-medium text-[var(--text-primary)]">Type de pari</label>
          <select
            id="bet_type"
            value={betType}
            onChange={(e) => setBetType(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            {Object.entries(BET_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {betType === "map_winner" && (
          <Input id="map_number" name="map_number" label="Numéro de map" type="number" min={1} max={5} defaultValue={1} required />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="label_a"
            name="label_a"
            label="Label A"
            placeholder={match.team_a_name}
            defaultValue={match.team_a_name}
          />
          <Input
            id="label_b"
            name="label_b"
            label="Label B"
            placeholder={match.team_b_name}
            defaultValue={match.team_b_name}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="odd_a" name="odd_a" label="Cote A" type="number" step="0.01" min="1.01" required placeholder="1.85" />
          <Input id="odd_b" name="odd_b" label="Cote B" type="number" step="0.01" min="1.01" required placeholder="2.10" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Fermer</Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Enregistrer la cote
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export { AdminMatchsClient };
