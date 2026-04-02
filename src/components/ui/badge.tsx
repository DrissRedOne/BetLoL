import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "live" | "upcoming" | "finished" | "cancelled" | "won" | "lost" | "league";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-[#E2E8F0]",
  live: "bg-[#FF4655]/20 text-[#FF4655] animate-pulse",
  upcoming: "bg-[#00D4FF]/20 text-[#00D4FF]",
  finished: "bg-white/10 text-[#64748B]",
  cancelled: "bg-white/5 text-[#64748B] line-through",
  won: "bg-[#00FF87]/20 text-[#00FF87]",
  lost: "bg-[#FF4655]/20 text-[#FF4655]",
  league: "bg-[#C89B3C]/20 text-[#C89B3C]",
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
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4655]" />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
