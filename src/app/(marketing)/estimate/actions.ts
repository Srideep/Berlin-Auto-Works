"use server";

import type { ActionState } from "@/lib/action-state";
import { parseFormAction } from "@/lib/form-action";
import { estimateRequestSchema } from "@/modules/estimates/estimate-request";
import { saveEstimateRequest } from "@/modules/estimates/save-request";

export async function submitEstimateRequest(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction("estimate", estimateRequestSchema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  const saved = await saveEstimateRequest(parsed.data);
  if (!saved.ok) {
    return { status: "unavailable", message: saved.message, fieldErrors: {} };
  }
  return {
    status: "success",
    message: "Request received. An advisor will follow up. A confirmation email is sent when email is configured.",
    fieldErrors: {},
  };
}
