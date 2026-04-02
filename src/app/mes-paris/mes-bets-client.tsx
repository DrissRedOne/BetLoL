"use client";

import { useState } from "react";
import type { BetWithDetails } from "@/types";
import { BetHistory } from "@/components/bet/bet-history";
import { cn } from "@/lib/utils";

interface MesBetsClientProps {
  pendingBets: BetWithDetails[];
  settledBets: BetWithDetails[];
}

const BETS_PER_PAGE = 10;

function MesBetsClient({ pendingBets, settledBets }: MesBetsClientProps) {
  const [tab, setTab] = useState<"pending" | "settled">("pending");
  const [visibleCount, setVisibleCount] = useState(BETS_PER_PAGE);

  const currentBets = tab === "pending" ? pendingBets : settledBets;
  const displayed = currentBets.slice(0, visibleCount);
  const hasMore = visibleCount < currentBets.length;

  function handleTabChange(newTab: "pending" | "settled") {
    setTab(newTab);
    setVisibleCount(BETS_PER_PAGE);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
        <TabButton
          active={tab === "pending"}
          onClick={() => handleTabChange("pending")}
          count={pendingBets.length}
        >
          En cours
        </TabButton>
        <TabButton
          active={tab === "settled"}
          onClick={() => handleTabChange("settled")}
          count={settledBets.length}
        >
          Terminés
        </TabButton>
      </div>

      <BetHistory
        bets={displayed}
        emptyMessage={
          tab === "pending"
            ? "Aucun pari en cours"
            : "Aucun pari terminé"
        }
      />

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + BETS_PER_PAGE)}
            className="rounded-lg bg-white/5 px-6 py-2 text-sm text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Voir plus ({currentBets.length - visibleCount} restants)
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all cursor-pointer",
        active
          ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      )}
    >
      {children}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs font-[family-name:var(--font-mono)]",
          active
            ? "bg-[var(--bg-primary)]/20 text-[var(--bg-primary)]"
            : "bg-white/10 text-[var(--text-muted)]"
        )}
      >
        {count}
      </span>
    </button>
  );
}

export { MesBetsClient };
