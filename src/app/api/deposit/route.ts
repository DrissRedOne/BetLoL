import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDepositSession } from "@/lib/stripe";
import { depositSchema } from "@/lib/validators/bet";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const result = depositSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = await createDepositSession(
      userData.user.id,
      result.data.amount,
      `${appUrl}/portefeuille`
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
