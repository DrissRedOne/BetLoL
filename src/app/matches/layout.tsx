import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matchs LoL — BetLoL",
  description: "Tous les matchs League of Legends : LEC, LCK, LPL, LCS, Worlds. Filtrez par ligue et statut.",
};

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
