"use client";

import { FormEvent, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface PayInvoiceProps {
  clientSecret: string;
  returnUrl: string;
}

export function PayInvoice({ clientSecret, returnUrl }: PayInvoiceProps) {
  if (!stripePromise) {
    return (
      <p className="text-sm leading-6 text-muted">
        Card payment is not configured. The invoice total is still on this page.
      </p>
    );
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm returnUrl={returnUrl} />
    </Elements>
  );
}

function PaymentForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setPending(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    setPending(false);
    if (result.error) {
      setMessage(result.error.message ?? "The payment could not be confirmed.");
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <PaymentElement />
      {message ? <p className="text-sm text-danger">{message}</p> : null}
      <button
        type="submit"
        disabled={!stripe || pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-5 text-base font-semibold text-white hover:bg-copper-dark disabled:opacity-60"
      >
        {pending ? "Confirming…" : "Pay invoice"}
      </button>
    </form>
  );
}
