import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PayInvoice } from "@/components/account/pay-invoice";
import { RecordPlaceholder } from "@/components/account/record-placeholder";
import { getDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { paymentIntentForInvoice } from "@/modules/billing/stripe";
import { requireCustomer } from "@/modules/identity/current-session";

export const metadata: Metadata = { title: "Invoice" };

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await requireCustomer();
  if (!customer) {
    return (
      <RecordPlaceholder
        title="Invoice"
        recordId={id}
        description="Balance and payment. Card details stay with the payment provider."
        actionHref="/account/invoices"
        actionLabel="All invoices"
      />
    );
  }

  const invoice = await getDb().invoice.findFirst({
    where: { id, customerId: customer.customerId },
    select: {
      id: true,
      status: true,
      currency: true,
      totalCents: true,
      balanceDueCents: true,
    },
  });
  if (!invoice) {
    notFound();
  }

  const payment = await paymentIntentForInvoice({
    invoiceId: invoice.id,
    customerId: customer.customerId,
  });
  const returnUrl = new URL(`/account/invoices/${invoice.id}`, getSiteUrl()).toString();

  return (
    <article className="max-w-xl space-y-6">
      <header>
        <h1 className="text-3xl font-medium text-ink">Invoice</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          Status: {invoice.status}. Balance {formatMoney(invoice.balanceDueCents, invoice.currency)} of{" "}
          {formatMoney(invoice.totalCents, invoice.currency)}. Card details stay with the payment provider.
        </p>
      </header>
      {payment && "clientSecret" in payment ? (
        <PayInvoice clientSecret={payment.clientSecret} returnUrl={returnUrl} />
      ) : (
        <p className="text-sm leading-6 text-muted">
          {payment && "error" in payment
            ? payment.error
            : "Card payment is not configured. The balance is shown above."}
        </p>
      )}
    </article>
  );
}
