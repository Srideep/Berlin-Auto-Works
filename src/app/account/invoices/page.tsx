import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { requireCustomer } from "@/modules/identity/current-session";

export const metadata: Metadata = { title: "Invoices" };

export default async function Page() {
  const customer = await requireCustomer();
  const invoices = customer
    ? await getDb().invoice.findMany({
        where: { customerId: customer.customerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          currency: true,
          balanceDueCents: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Balances and paid invoices." />
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="When a balance is due, you will pay it here through the payment provider. Card numbers never come to this site."
        />
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <Link
                href={`/account/invoices/${invoice.id}`}
                className="flex min-h-14 items-center justify-between gap-4 px-4 text-sm"
              >
                <span className="font-semibold text-ink">{invoice.status}</span>
                <span className="text-muted">
                  {(invoice.balanceDueCents / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
