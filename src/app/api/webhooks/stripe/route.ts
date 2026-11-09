import { applyStripeEvent } from "@/modules/billing/stripe";

export async function POST(request: Request): Promise<Response> {
  const payload = await request.text();
  const result = await applyStripeEvent(
    payload,
    request.headers.get("stripe-signature"),
  );
  return new Response(null, { status: result.status });
}
