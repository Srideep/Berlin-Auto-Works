"use server";

import type { ActionState } from "@/lib/action-state";
import { runPreviewAction } from "@/lib/form-action";
import { estimateRequestSchema } from "@/modules/estimates/estimate-request";

export async function submitEstimateRequest(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runPreviewAction("estimate", estimateRequestSchema, formData);
}
