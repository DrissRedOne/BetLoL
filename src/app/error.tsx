"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <AlertCircle className="h-12 w-12 text-[var(--accent-red)] mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Une erreur est survenue</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        {error.message || "Quelque chose s'est mal passé. Réessayez."}
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
