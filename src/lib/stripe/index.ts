import Stripe from "stripe";

function getStripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
}

export async function createDepositSession(
  userId: string,
  amount: number,
  returnUrl: string
): Promise<string> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Dépôt BetLoL",
            description: `Dépôt de ${amount}€ sur votre compte BetLoL`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?cancelled=true`,
    metadata: {
      user_id: userId,
      type: "deposit",
    },
  });

  return session.url ?? returnUrl;
}
