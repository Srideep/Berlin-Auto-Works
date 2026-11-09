import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { requireCustomer } from "@/modules/identity/current-session";

export const metadata: Metadata = { title: "Estimates" };

export default async function Page() {
  const customer = await requireCustomer();
  const estimates = customer
    ? await getDb().estimate.findMany({
        where: { customerId: customer.customerId },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, totalCents: true, currency: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Estimates" description="Requests and estimates sent by the shop." />
      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates"
          description="Request an estimate from the shop site. Drafts you send show up here."
          actionHref="/estimate"
          actionLabel="Request an estimate"
        />
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {estimates.map((estimate) => (
            <li key={estimate.id}>
              <Link
                href={`/account/estimates/${estimate.id}`}
                className="flex min-h-14 items-center justify-between gap-4 px-4 text-sm"
              >
                <span className="font-semibold text-ink">{estimate.status}</span>
                <span className="text-muted">
                  {(estimate.totalCents / 100).toFixed(2)} {estimate.currency.toUpperCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
