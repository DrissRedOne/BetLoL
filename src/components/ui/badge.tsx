import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "live" | "upcoming" | "finished" | "cancelled" | "won" | "lost" | "league";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-[var(--text-primary)]",
  live: "bg-[var(--accent-red)]/20 text-[var(--accent-red)] animate-pulse",
  upcoming: "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]",
  finished: "bg-white/10 text-[var(--text-muted)]",
  cancelled: "bg-white/5 text-[var(--text-muted)] line-through",
  won: "bg-[var(--accent-green)]/20 text-[var(--accent-green)]",
  lost: "bg-[var(--accent-red)]/20 text-[var(--accent-red)]",
  league: "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]",
};

function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-red)]" />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
