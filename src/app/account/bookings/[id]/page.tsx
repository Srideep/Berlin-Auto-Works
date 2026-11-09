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
  describeVehicle,
  formatVisitTime,
} from "@/modules/scheduling/visit-display";

export const instant = false;

export const metadata: Metadata = { title: "Appointment" };

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
        title="Appointment"
        recordId={id}
        description="Time, vehicle, and status for this visit."
        actionHref="/account/bookings"
        actionLabel="All appointments"
      />
    );
  }

  const appointment = await getDb().appointment.findFirst({
    where: { id, customerId: customer.customerId },
    select: {
      status: true,
      startsAt: true,
      serviceSlug: true,
      notes: true,
      vehicleYear: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          licensePlate: true,
        },
      },
      location: { select: { timezone: true } },
    },
  });
  if (!appointment) {
    notFound();
  }

  const serviceName = appointment.serviceSlug
    ? (getService(appointment.serviceSlug)?.name ?? appointment.serviceSlug)
    : "Service";
  const notes = appointment.notes?.trim() ?? "";
  const vehicleName = describeVehicle({
    year: appointment.vehicle?.year ?? appointment.vehicleYear,
    make: appointment.vehicle?.make ?? appointment.vehicleMake,
    model: appointment.vehicle?.model ?? appointment.vehicleModel,
    licensePlate: appointment.vehicle?.licensePlate,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment"
        description="Time, vehicle, and status for this visit."
        actionHref="/account/bookings"
        actionLabel="All appointments"
      />
      <dl className="space-y-4 rounded-2xl border border-line bg-card p-5 text-base leading-7">
        <div>
          <dt className="font-semibold text-ink">Status</dt>
          <dd className="text-muted">{appointmentStatusLabel(appointment.status)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Time</dt>
          <dd className="text-muted">
            <time dateTime={appointment.startsAt.toISOString()}>
              {formatVisitTime(appointment.startsAt, appointment.location.timezone)}
            </time>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Service</dt>
          <dd className="text-muted">{serviceName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Vehicle</dt>
          <dd className="text-muted">
            {appointment.vehicle ? (
              <Link
                href={`/account/vehicles/${appointment.vehicle.id}`}
                className="font-semibold text-copper"
              >
                {vehicleName}
              </Link>
            ) : (
              vehicleName
            )}
          </dd>
        </div>
        {notes.length > 0 ? (
          <div>
            <dt className="font-semibold text-ink">Notes</dt>
            <dd className="whitespace-pre-wrap text-muted">{notes}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
