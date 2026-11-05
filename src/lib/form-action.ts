import "server-only";

import type { ZodType } from "zod";

import type { ActionState } from "@/lib/action-state";
import { fieldErrorsFromZod } from "@/lib/zod";
import {
  enforceRateLimit,
  type RateLimitPolicyName,
} from "@/modules/identity/rate-limit";

const unavailableMessage =
  "This form is not connected yet. Nothing was saved or sent.";

function readFormValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      values[key] = value;
    }
  }
  values.company ??= "";
  return values;
}

export async function runPreviewAction(
  policy: RateLimitPolicyName,
  schema: ZodType,
  formData: FormData,
): Promise<ActionState> {
  const decision = await enforceRateLimit(policy);
  if (!decision.allowed) {
    return {
      status: "limited",
      message: `Too many attempts. Try again in about ${decision.retryAfterSeconds} seconds.`,
      fieldErrors: {},
    };
  }

  const parsed = schema.safeParse(readFormValues(formData));
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error);
    if (fieldErrors.company) {
      return {
        status: "invalid",
        message: "Could not submit that form.",
        fieldErrors: {},
      };
    }
    return {
      status: "invalid",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  return {
    status: "unavailable",
    message: unavailableMessage,
    fieldErrors: {},
  };
}
