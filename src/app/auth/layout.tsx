import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — BetLoL",
  description: "Connectez-vous ou créez un compte BetLoL pour parier sur League of Legends.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
