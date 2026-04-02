import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  username?: string;
  balance?: number;
  isAdmin?: boolean;
}

function Navbar({ username, balance, isAdmin }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0A0E17]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#00D4FF]">Bet</span>
            <span className="text-xl font-bold text-[#C89B3C]">LoL</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/matches">Matchs</NavLink>
            {username && <NavLink href="/mes-paris">Mes Paris</NavLink>}
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {username ? (
            <>
              <Link
                href="/portefeuille"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                  "bg-[#00FF87]/10 text-[#00FF87] text-sm font-mono font-medium",
                  "hover:bg-[#00FF87]/20 transition-colors"
                )}
              >
                {balance?.toFixed(2)} €
              </Link>
              <span className="hidden md:block text-sm text-[#64748B]">{username}</span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Connexion</Button>
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
      className="text-sm text-[#64748B] hover:text-[#E2E8F0] transition-colors"
    >
      {children}
    </Link>
  );
}

export { Navbar };
