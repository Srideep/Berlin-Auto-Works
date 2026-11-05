"use server";

import type { ActionState } from "@/lib/action-state";
import { runPreviewAction } from "@/lib/form-action";
import { bookingRequestSchema } from "@/modules/scheduling/booking-request";

export async function submitBookingRequest(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runPreviewAction("booking", bookingRequestSchema, formData);
}
