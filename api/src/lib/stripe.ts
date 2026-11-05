import Stripe from "stripe";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "La variable STRIPE_SECRET_KEY est manquante.",
  );
}

export const stripe =
  new Stripe(stripeSecretKey);