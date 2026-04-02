import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminResultatsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Déclarer les résultats
        </h1>
        <Link
          href="/admin"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>

      {/* Skeleton unsettled matches */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="league">LCK</Badge>
            <Badge variant="live">EN DIRECT</Badge>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">T1</span>
            <span className="text-[var(--text-muted)] text-sm font-[family-name:var(--font-mono)]">
              2 - 1
            </span>
            <span className="font-medium">Gen.G</span>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" className="flex-1" disabled>
              T1 gagne
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" disabled>
              Gen.G gagne
            </Button>
          </div>
        </Card>

        <Card>
          <p className="text-center text-[var(--text-muted)] py-4">
            Skeleton — logique de settlement à venir
          </p>
        </Card>
      </div>
    </div>
  );
}
