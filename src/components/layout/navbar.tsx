"use client";

import Link from "next/link";
import { Swords } from "lucide-react";
import { AuthButton } from "@/components/layout/auth-button";

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo + links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1">
            <Swords className="h-5 w-5 text-[var(--accent-cyan)]" />
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--accent-cyan)]">
              Bet
            </span>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--accent-gold)]">
              LoL
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/matches">Matchs</NavLink>
          </div>
        </div>

        {/* Auth */}
        <AuthButton />
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      {children}
    </Link>
  );
}

export { Navbar };
