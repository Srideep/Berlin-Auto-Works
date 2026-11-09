"use server";

import type { ActionState } from "@/lib/action-state";
import { parseFormAction } from "@/lib/form-action";
import { listPublishedServices } from "@/modules/catalog/published";
import { bookingRequestSchemaFor } from "@/modules/scheduling/booking-request";
import { saveBookingRequest } from "@/modules/scheduling/save-booking";

export async function submitBookingRequest(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const services = await listPublishedServices();
  const parsed = await parseFormAction(
    "booking",
    bookingRequestSchemaFor(services.map((service) => service.slug)),
    formData,
  );
  if (!parsed.ok) {
    return parsed.state;
  }
  const saved = await saveBookingRequest(parsed.data);
  if (!saved.ok) {
    return { status: "unavailable", message: saved.message, fieldErrors: {} };
  }
  return {
    status: "success",
    message: "Request received. The shop will confirm a time. A confirmation email is sent when email is configured.",
    fieldErrors: {},
  };
}
