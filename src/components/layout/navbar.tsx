import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Swords, Wallet, LogIn } from "lucide-react";

interface NavbarProps {
  username?: string;
  balance?: number;
  isAdmin?: boolean;
}

function Navbar({ username, balance, isAdmin }: NavbarProps) {
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
            {username && <NavLink href="/mes-paris">Mes Paris</NavLink>}
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {username ? (
            <>
              <Link
                href="/portefeuille"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                  "bg-[var(--accent-green)]/10 text-[var(--accent-green)] text-sm font-[family-name:var(--font-mono)] font-medium",
                  "hover:bg-[var(--accent-green)]/20 transition-colors"
                )}
              >
                <Wallet className="h-4 w-4" />
                {balance?.toFixed(2)} €
              </Link>
              <span className="hidden md:block text-sm text-[var(--text-muted)]">
                {username}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Inscription</Button>
              </Link>
            </div>
          )}
        </div>
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
