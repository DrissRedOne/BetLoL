import Link from "next/link";
import { Swords } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Swords className="h-4 w-4 text-[var(--accent-cyan)]" />
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--accent-cyan)]">
                Bet
              </span>
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--accent-gold)]">
                LoL
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Paris esportifs League of Legends.
              LEC, LCK, LPL, LCS, Worlds et plus.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              Navigation
            </h3>
            <ul className="space-y-2">
              <FooterLink href="/">Accueil</FooterLink>
              <FooterLink href="/matches">Tous les matchs</FooterLink>
              <FooterLink href="/mes-paris">Mes paris</FooterLink>
              <FooterLink href="/portefeuille">Portefeuille</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              Légal
            </h3>
            <ul className="space-y-2">
              <FooterLink href="#">Conditions d&apos;utilisation</FooterLink>
              <FooterLink href="#">Politique de confidentialité</FooterLink>
              <FooterLink href="#">Jeu responsable</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border-subtle)] pt-6 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} BetLoL. Tous droits réservés. Jouez responsablement. 18+
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

export { Footer };
