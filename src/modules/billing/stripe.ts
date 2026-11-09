import "server-only";

import Stripe from "stripe";

import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

function stripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
}

export async function paymentIntentForInvoice(input: {
  invoiceId: string;
  customerId: string;
}): Promise<{ clientSecret: string } | { error: string } | null> {
  if (!stripeConfigured()) {
    return null;
  }
  const invoice = await getDb().invoice.findFirst({
    where: { id: input.invoiceId, customerId: input.customerId },
    select: {
      id: true,
      status: true,
      currency: true,
      balanceDueCents: true,
      paymentIntentId: true,
    },
  });
  if (!invoice) {
    return { error: "That invoice is not on your account." };
  }
  if (invoice.status === "paid" || invoice.balanceDueCents <= 0) {
    return { error: "This invoice is already paid." };
  }
  if (invoice.status !== "open" && invoice.status !== "processing") {
    return { error: "This invoice is not ready to pay." };
  }

  const stripe = stripeClient();
  if (invoice.paymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(invoice.paymentIntentId);
    if (existing.client_secret && existing.status !== "canceled") {
      return { clientSecret: existing.client_secret };
    }
  }

  const created = await stripe.paymentIntents.create(
    {
      amount: invoice.balanceDueCents,
      currency: invoice.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { invoiceId: invoice.id },
    },
    { idempotencyKey: `invoice-${invoice.id}-intent` },
  );
  if (!created.client_secret) {
    return { error: "The payment provider did not start a payment." };
  }
  await getDb().invoice.update({
    where: { id: invoice.id },
    data: { paymentIntentId: created.id },
  });
  return { clientSecret: created.client_secret };
}

export async function applyStripeEvent(
  payload: string,
  signature: string | null,
): Promise<{ status: number }> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret || !signature) {
    return { status: 400 };
  }
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return { status: 400 };
  }

  try {
    await getDb().stripeEvent.create({ data: { id: event.id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: 200 };
    }
    throw error;
  }

  if (
    event.type !== "payment_intent.succeeded" &&
    event.type !== "payment_intent.processing"
  ) {
    return { status: 200 };
  }

  const intent = event.data.object;
  const invoiceId = intent.metadata.invoiceId;
  if (!invoiceId || intent.id.length === 0) {
    return { status: 200 };
  }

  const invoice = await getDb().invoice.findFirst({
    where: { id: invoiceId, paymentIntentId: intent.id },
    select: { id: true, status: true, version: true, locationId: true },
  });
  if (!invoice || invoice.status === "paid") {
    return { status: 200 };
  }

  if (event.type === "payment_intent.processing") {
    await getDb().invoice.update({
      where: { id: invoice.id },
      data: { status: "processing", version: { increment: 1 } },
    });
    return { status: 200 };
  }

  await getDb().invoice.update({
    where: { id: invoice.id },
    data: {
      status: "paid",
      balanceDueCents: 0,
      version: { increment: 1 },
    },
  });
  console.info(
    JSON.stringify({
      audit: {
        locationId: invoice.locationId,
        actorId: "stripe",
        action: "invoice.paid",
        subjectType: "invoice",
        subjectId: invoice.id,
      },
    }),
  );
  return { status: 200 };
}
