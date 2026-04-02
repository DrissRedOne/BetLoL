"use client";

import type { Odd } from "@/types";
import { formatOdd } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OddsDisplayProps {
  odd: Odd;
  selectedSelection?: "a" | "b" | null;
  onSelect?: (selection: "a" | "b") => void;
  compact?: boolean;
}

function OddsDisplay({ odd, selectedSelection, onSelect, compact }: OddsDisplayProps) {
  return (
    <div className={cn("flex gap-2", compact ? "gap-1" : "gap-2")}>
      <OddsButton
        label={odd.label_a}
        value={odd.odd_a}
        selected={selectedSelection === "a"}
        onClick={() => onSelect?.("a")}
        compact={compact}
      />
      <OddsButton
        label={odd.label_b}
        value={odd.odd_b}
        selected={selectedSelection === "b"}
        onClick={() => onSelect?.("b")}
        compact={compact}
      />
    </div>
  );
}

function OddsButton({
  label,
  value,
  selected,
  onClick,
  compact,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-between rounded-lg border transition-all duration-200",
        compact ? "px-2 py-1.5" : "px-3 py-2",
        selected
          ? "border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]"
          : "border-white/[0.06] bg-white/[0.02] text-[#E2E8F0] hover:border-[#00D4FF]/30 hover:bg-white/[0.04]",
        onClick && "cursor-pointer"
      )}
    >
      <span className={cn("text-xs truncate", compact ? "max-w-[60px]" : "max-w-[100px]")}>
        {label}
      </span>
      <span className={cn(
        "font-mono font-semibold",
        compact ? "text-sm" : "text-sm",
        selected ? "text-[#00D4FF]" : "text-[#C89B3C]"
      )}>
        {formatOdd(value)}
      </span>
    </button>
  );
}

export { OddsDisplay };
