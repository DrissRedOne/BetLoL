import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Swords } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <Swords className="h-8 w-8 text-[var(--accent-cyan)] mx-auto mb-3" />
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          <span className="text-[var(--accent-cyan)]">Bet</span>
          <span className="text-[var(--accent-gold)]">LoL</span>
        </h1>
        <p className="text-[var(--text-muted)] mt-2">Connectez-vous à votre compte</p>
      </div>

      <Card>
        <form className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
          />
          <Input
            id="password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
          />
          <Button type="button" className="w-full" disabled>
            Se connecter
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-[var(--accent-cyan)] hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </Card>
    </div>
  );
}
