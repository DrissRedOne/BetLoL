"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { Wallet, LogIn, LogOut, ChevronDown, Shield } from "lucide-react";

function AuthButton() {
  const { user, profile, loading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-8 w-24 rounded-lg bg-white/5 animate-pulse" />
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Connexion</span>
          </Button>
        </Link>
        <Link href="/auth/register" className="hidden sm:block">
          <Button size="sm">Inscription</Button>
        </Link>
      </div>
    );
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast("Déconnexion réussie", "info");
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {/* Balance */}
      <Link
        href="/portefeuille"
        className={cn(
          "hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5",
          "bg-[var(--accent-green)]/10 text-[var(--accent-green)] text-sm font-[family-name:var(--font-mono)] font-medium",
          "hover:bg-[var(--accent-green)]/20 transition-colors"
        )}
      >
        <Wallet className="h-4 w-4" />
        {profile.balance.toFixed(2)} €
      </Link>

      {/* User dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors cursor-pointer",
            "hover:bg-white/5",
            menuOpen ? "bg-white/5 text-[var(--text-primary)]" : "text-[var(--text-muted)]"
          )}
        >
          <span className="hidden md:inline max-w-[100px] truncate">
            {profile.username}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", menuOpen && "rotate-180")} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenuOpen(false);
              }}
              role="button"
              tabIndex={-1}
              aria-label="Fermer le menu"
            />
            <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] py-1 shadow-xl">
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {profile.username}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
                  {profile.balance.toFixed(2)} €
                </p>
              </div>

              <Link
                href="/mes-paris"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              >
                Mes paris
              </Link>
              <Link
                href="/portefeuille"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              >
                Portefeuille
              </Link>

              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Administration
                </Link>
              )}

              <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Déconnexion
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { AuthButton };
