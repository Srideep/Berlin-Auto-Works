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

export async function parseFormAction<T>(
  policy: RateLimitPolicyName,
  schema: ZodType<T>,
  formData: FormData,
): Promise<{ ok: true; data: T } | { ok: false; state: ActionState }> {
  const decision = await enforceRateLimit(policy);
  if (!decision.allowed) {
    return {
      ok: false,
      state: {
        status: "limited",
        message: `Too many attempts. Try again in about ${decision.retryAfterSeconds} seconds.`,
        fieldErrors: {},
      },
    };
  }

  const parsed = schema.safeParse(readFormValues(formData));
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error);
    if (fieldErrors.company) {
      return {
        ok: false,
        state: {
          status: "invalid",
          message: "Could not submit that form.",
          fieldErrors: {},
        },
      };
    }
    return {
      ok: false,
      state: {
        status: "invalid",
        message: "Check the highlighted fields and try again.",
        fieldErrors,
      },
    };
  }

  return { ok: true, data: parsed.data };
}

export async function runPreviewAction(
  policy: RateLimitPolicyName,
  schema: ZodType,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction(policy, schema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  return {
    status: "unavailable",
    message: unavailableMessage,
    fieldErrors: {},
  };
}
