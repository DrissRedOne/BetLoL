"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (username.length < 3) {
      setError("Le pseudo doit faire au moins 3 caractères");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username,
        balance: 0,
        role: "user",
        kyc_status: "pending",
      });
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-[#00D4FF]">Bet</span>
          <span className="text-[#C89B3C]">LoL</span>
        </h1>
        <p className="text-[#64748B] mt-2">Créez votre compte</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="username"
            label="Pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="MonPseudo"
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
          />
          <Input
            id="password"
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            required
          />

          {error && (
            <p className="text-sm text-[#FF4655]">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Créer mon compte
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[#64748B]">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-[#00D4FF] hover:underline">
            Se connecter
          </Link>
        </p>
      </Card>
    </div>
  );
}
