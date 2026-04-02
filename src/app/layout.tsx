import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BetLoL — Paris Esportifs League of Legends",
    template: "%s | BetLoL",
  },
  description:
    "Pariez sur vos matchs League of Legends favoris. LEC, LCK, LPL, LCS, Worlds, MSI et ligues régionales. Cotes en direct.",
  keywords: ["League of Legends", "paris esportifs", "LoL", "LEC", "LCK", "LPL", "LCS", "Worlds", "esports betting"],
  authors: [{ name: "BetLoL" }],
};

export const viewport: Viewport = {
  themeColor: "#0A0E17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-[var(--accent-cyan)] focus:px-4 focus:py-2 focus:text-[var(--bg-primary)] focus:text-sm focus:font-medium"
          >
            Aller au contenu principal
          </a>
          <Navbar />
          <main id="main-content" className="flex-1 pb-16 md:pb-0 animate-page-in">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
