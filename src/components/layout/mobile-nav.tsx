"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Swords, ClipboardList, Wallet, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Matchs", icon: Swords },
  { href: "/mes-paris", label: "Mes Paris", icon: ClipboardList },
  { href: "/portefeuille", label: "Solde", icon: Wallet },
  { href: "/auth/login", label: "Profil", icon: User },
];

function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--text-muted)]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileNav };
