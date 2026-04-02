import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <Swords className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
      <h2 className="text-4xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] mb-2">
        404
      </h2>
      <p className="text-lg font-semibold mb-1">Page introuvable</p>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/">
        <Button>Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
