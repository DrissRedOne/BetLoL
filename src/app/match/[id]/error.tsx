"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MatchError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <AlertCircle className="h-12 w-12 text-[var(--accent-red)] mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Match introuvable</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">{error.message}</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={reset}>Réessayer</Button>
        <Link href="/matches">
          <Button variant="outline">Retour aux matchs</Button>
        </Link>
      </div>
    </div>
  );
}
