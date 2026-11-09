import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { requireCustomer } from "@/modules/identity/current-session";

export const metadata: Metadata = { title: "Appointments" };

export default async function Page() {
  const customer = await requireCustomer();
  const appointments = customer
    ? await getDb().appointment.findMany({
        where: { customerId: customer.customerId },
        orderBy: { startsAt: "desc" },
        select: {
          id: true,
          status: true,
          startsAt: true,
          serviceSlug: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Upcoming and past visits."
        actionHref="/book"
        actionLabel="Book a visit"
      />
      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments"
          description="Book a visit when you are ready. Guest booking is on the public site."
          actionHref="/book"
          actionLabel="Book a visit"
        />
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="flex min-h-14 items-center justify-between gap-4 px-4 text-sm">
              <span className="font-semibold text-ink">
                {appointment.serviceSlug ?? "Service"} · {appointment.status}
              </span>
              <Link href={`/account/bookings/${appointment.id}`} className="text-copper">
                {appointment.startsAt.toISOString().slice(0, 10)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
