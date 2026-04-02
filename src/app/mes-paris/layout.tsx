import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Paris — BetLoL",
  description: "Suivez vos paris League of Legends en cours et terminés.",
};

export default function MesBetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
