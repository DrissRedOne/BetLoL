import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portefeuille — BetLoL",
  description: "Gérez votre solde, déposez et retirez des fonds sur BetLoL.",
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
