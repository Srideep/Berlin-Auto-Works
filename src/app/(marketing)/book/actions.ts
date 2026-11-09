"use server";

import type { ActionState } from "@/lib/action-state";
import { runPreviewAction } from "@/lib/form-action";
import { listPublishedServices } from "@/modules/catalog/published";
import { bookingRequestSchemaFor } from "@/modules/scheduling/booking-request";

export async function submitBookingRequest(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const services = await listPublishedServices();
  return runPreviewAction(
    "booking",
    bookingRequestSchemaFor(services.map((service) => service.slug)),
    formData,
  );
}
