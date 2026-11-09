import "server-only";

import { getDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { attachUploadedFile } from "@/modules/files/storage";
import { getActiveLocation } from "@/modules/locations/active";
import { enqueueEmail } from "@/modules/notifications/queue";
import type { BookingRequest } from "@/modules/scheduling/booking-request";

function contactName(input: BookingRequest): string {
  return [input.contactFirstName, input.contactMiddleName, input.contactLastName]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

export async function saveBookingRequest(
  input: BookingRequest,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "The shop database is not configured." };
  }
  const location = await getActiveLocation();
  if (!location) {
    return { ok: false, message: "The shop record is not available." };
  }

  const email = input.contactEmail.trim().toLowerCase();
  const name = contactName(input);
  const phone = input.contactPhone.trim();
  const db = getDb();

  const customer = await db.customer.upsert({
    where: { email },
    update: { name, phone },
    create: { email, name, phone },
    select: { id: true },
  });

  const existingVehicle = await db.vehicle.findFirst({
    where: {
      customerId: customer.id,
      year: input.vehicleYear,
      make: input.vehicleMake,
      model: input.vehicleModel,
    },
    select: { id: true },
  });
  const vehicle =
    existingVehicle ??
    (await db.vehicle.create({
      data: {
        customerId: customer.id,
        year: input.vehicleYear,
        make: input.vehicleMake,
        model: input.vehicleModel,
      },
      select: { id: true },
    }));

  const appointment = await db.appointment.create({
    data: {
      locationId: location.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: "requested",
      startsAt: new Date(`${input.preferredDate}T13:00:00.000Z`),
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      serviceSlug: input.serviceSlug,
      notes: input.notes,
      vehicleYear: input.vehicleYear,
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
    },
    select: { id: true },
  });

  if (input.fileId && input.fileToken) {
    await attachUploadedFile({
      fileId: input.fileId,
      token: input.fileToken,
      appointmentId: appointment.id,
    });
  }

  const site = getSiteUrl();
  try {
    await enqueueEmail({
    to: email,
    template: "booking_received",
    locationId: location.id,
    subjectId: appointment.id,
    subject: "We received your appointment request",
    text: [
      `Hello ${name},`,
      "",
      `${location.name} received your request for ${input.preferredDate}.`,
      "The shop will confirm a time before the visit is final.",
      "",
      site.origin,
    ].join("\n"),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "booking email failed");
  }

  return { ok: true, id: appointment.id };
}
