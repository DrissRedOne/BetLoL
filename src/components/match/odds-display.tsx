"use client";

import type { Odd } from "@/types";
import { formatOdd } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OddsDisplayProps {
  odd: Odd;
  selectedSelection?: "a" | "b" | null;
  onSelect?: (oddId: string, selection: "a" | "b") => void;
  flashMap?: Record<string, "up" | "down">;
}

function OddsDisplay({ odd, selectedSelection, onSelect, flashMap }: OddsDisplayProps) {
  const flashA = flashMap?.[`${odd.id}-a`];
  const flashB = flashMap?.[`${odd.id}-b`];

  return (
    <div className="flex gap-2">
      <OddsButton
        label={odd.label_a}
        value={odd.odd_a}
        selected={selectedSelection === "a"}
        onClick={onSelect ? () => onSelect(odd.id, "a") : undefined}
        flash={flashA}
      />
      <OddsButton
        label={odd.label_b}
        value={odd.odd_b}
        selected={selectedSelection === "b"}
        onClick={onSelect ? () => onSelect(odd.id, "b") : undefined}
        flash={flashB}
      />
    </div>
  );
}

function OddsButton({
  label,
  value,
  selected,
  onClick,
  flash,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick?: () => void;
  flash?: "up" | "down";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-between rounded-lg border px-3 py-2 transition-all duration-200",
        selected
          ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
          : "border-[var(--border-subtle)] bg-white/[0.02] text-[var(--text-primary)] hover:border-[var(--accent-cyan)]/30 hover:bg-white/[0.04]",
        onClick && "cursor-pointer",
        flash === "up" && "odds-flash-up",
        flash === "down" && "odds-flash-down"
      )}
    >
      <span className="text-xs truncate max-w-[100px]">{label}</span>
      <span
        className={cn(
          "font-[family-name:var(--font-mono)] font-semibold text-sm",
          selected ? "text-[var(--accent-cyan)]" : "text-[var(--accent-gold)]"
        )}
      >
        {formatOdd(value)}
      </span>
    </button>
  );
}

export { OddsDisplay };
