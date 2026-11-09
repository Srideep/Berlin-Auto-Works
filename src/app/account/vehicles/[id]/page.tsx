import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecordPlaceholder } from "@/components/account/record-placeholder";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { parseRecordId } from "@/lib/record-id";
import { getService } from "@/modules/catalog/services";
import { requireCustomer } from "@/modules/identity/current-session";
import {
  appointmentStatusLabel,
  formatVisitTime,
} from "@/modules/scheduling/visit-display";

export const instant = false;

export const metadata: Metadata = { title: "Vehicle" };

function displayValue(value: string | null): string {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : "Not on file";
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseRecordId(rawId);
  const customer = await requireCustomer();
  if (!customer) {
    return (
      <RecordPlaceholder
        title="Vehicle"
        recordId={id}
        description="Service history for this vehicle will appear here."
        actionHref="/account/vehicles"
        actionLabel="All vehicles"
      />
    );
  }

  const vehicle = await getDb().vehicle.findFirst({
    where: { id, customerId: customer.customerId },
    select: {
      year: true,
      make: true,
      model: true,
      licensePlate: true,
      vin: true,
      appointments: {
        where: { customerId: customer.customerId },
        orderBy: { startsAt: "desc" },
        select: {
          id: true,
          status: true,
          startsAt: true,
          serviceSlug: true,
          location: { select: { timezone: true } },
        },
      },
    },
  });
  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        description="Service history for this vehicle."
        actionHref="/account/vehicles"
        actionLabel="All vehicles"
      />
      <dl className="space-y-4 rounded-2xl border border-line bg-card p-5 text-base leading-7">
        <div>
          <dt className="font-semibold text-ink">Year</dt>
          <dd className="text-muted">{vehicle.year}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Make</dt>
          <dd className="text-muted">{vehicle.make}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Model</dt>
          <dd className="text-muted">{vehicle.model}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Plate</dt>
          <dd className="text-muted">{displayValue(vehicle.licensePlate)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">VIN</dt>
          <dd className="text-muted">{displayValue(vehicle.vin)}</dd>
        </div>
      </dl>
      <section className="space-y-3">
        <h2 className="text-xl font-medium text-ink">Appointments</h2>
        {vehicle.appointments.length === 0 ? (
          <p className="text-base leading-7 text-muted">No visits are tied to this vehicle yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
            {vehicle.appointments.map((appointment) => {
              const serviceName = appointment.serviceSlug
                ? (getService(appointment.serviceSlug)?.name ?? appointment.serviceSlug)
                : "Service";
              return (
                <li key={appointment.id}>
                  <Link
                    href={`/account/bookings/${appointment.id}`}
                    className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-ink">
                      {serviceName} · {appointmentStatusLabel(appointment.status)}
                    </span>
                    <time
                      dateTime={appointment.startsAt.toISOString()}
                      className="text-copper"
                    >
                      {formatVisitTime(appointment.startsAt, appointment.location.timezone)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
