import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration — BetLoL",
  description: "Panel d'administration BetLoL.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
