import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { requireCustomer } from "@/modules/identity/current-session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Page() {
  const customer = await requireCustomer();
  const counts = customer
    ? await Promise.all([
        getDb().appointment.count({
          where: { customerId: customer.customerId, status: { in: ["requested", "confirmed"] } },
        }),
        getDb().estimate.count({
          where: { customerId: customer.customerId, status: { in: ["draft", "sent"] } },
        }),
        getDb().invoice.count({
          where: { customerId: customer.customerId, status: { in: ["open", "processing"] } },
        }),
      ])
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          customer
            ? `Signed in as ${customer.name}.`
            : "Upcoming appointments, open estimates, active repairs, and unpaid invoices."
        }
        actionHref="/book"
        actionLabel="Book service"
      />
      {counts ? (
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-2xl border border-line bg-card p-4">
            <p className="text-sm text-muted">Open appointments</p>
            <p className="mt-1 text-3xl text-ink">{counts[0]}</p>
          </li>
          <li className="rounded-2xl border border-line bg-card p-4">
            <p className="text-sm text-muted">Open estimates</p>
            <p className="mt-1 text-3xl text-ink">{counts[1]}</p>
          </li>
          <li className="rounded-2xl border border-line bg-card p-4">
            <p className="text-sm text-muted">Unpaid invoices</p>
            <p className="mt-1 text-3xl text-ink">{counts[2]}</p>
          </li>
        </ul>
      ) : (
        <EmptyState
          title="Nothing scheduled"
          description="When your account is connected, today and the open work will show up here."
          actionHref="/book"
          actionLabel="Book service"
        />
      )}
    </div>
  );
}
