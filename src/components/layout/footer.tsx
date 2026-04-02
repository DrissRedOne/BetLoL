import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0E17] py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-lg font-bold text-[#00D4FF]">Bet</span>
              <span className="text-lg font-bold text-[#C89B3C]">LoL</span>
            </div>
            <p className="text-sm text-[#64748B]">
              Paris esportifs League of Legends.
              LEC, LCK, LPL, LCS, Worlds et plus.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Navigation</h3>
            <ul className="space-y-2">
              <FooterLink href="/">Accueil</FooterLink>
              <FooterLink href="/matches">Tous les matchs</FooterLink>
              <FooterLink href="/mes-paris">Mes paris</FooterLink>
              <FooterLink href="/portefeuille">Portefeuille</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Légal</h3>
            <ul className="space-y-2">
              <FooterLink href="#">Conditions d&apos;utilisation</FooterLink>
              <FooterLink href="#">Politique de confidentialité</FooterLink>
              <FooterLink href="#">Jeu responsable</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.06] pt-6 text-center text-xs text-[#64748B]">
          © {new Date().getFullYear()} BetLoL. Tous droits réservés. Jouez responsablement. 18+
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        {children}
      </Link>
    </li>
  );
}

export { Footer };
