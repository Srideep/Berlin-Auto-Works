import "server-only";

import { getDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import type { EstimateRequest } from "@/modules/estimates/estimate-request";
import { attachUploadedFile } from "@/modules/files/storage";
import { getActiveLocation } from "@/modules/locations/active";
import { enqueueEmail } from "@/modules/notifications/queue";

function contactName(input: EstimateRequest): string {
  return [input.contactFirstName, input.contactMiddleName, input.contactLastName]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

export async function saveEstimateRequest(
  input: EstimateRequest,
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

  const estimate = await db.estimate.create({
    data: {
      locationId: location.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: "draft",
      customerNotes: input.concern,
    },
    select: { id: true },
  });

  if (input.fileId && input.fileToken) {
    await attachUploadedFile({
      fileId: input.fileId,
      token: input.fileToken,
      estimateId: estimate.id,
    });
  }

  const site = getSiteUrl();
  try {
    await enqueueEmail({
    to: email,
    template: "estimate_received",
    locationId: location.id,
    subjectId: estimate.id,
    subject: "We received your estimate request",
    text: [
      `Hello ${name},`,
      "",
      `${location.name} received your estimate request.`,
      "An advisor will send a written estimate before any work starts.",
      "",
      site.origin,
    ].join("\n"),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "estimate email failed");
  }

  return { ok: true, id: estimate.id };
}
