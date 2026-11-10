export {
  roleHasCapability,
  staffCapabilities,
  staffRoleLabels,
  staffRoles,
} from "@/modules/identity/roles";
export type { StaffCapability, StaffRole } from "@/modules/identity/roles";

export {
  consumeRateLimit,
  enforceRateLimit,
  rateLimitPolicies,
} from "@/modules/identity/rate-limit";
export type {
  RateLimitDecision,
  RateLimitPolicyName,
} from "@/modules/identity/rate-limit";

export {
  forgotPasswordSchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "@/modules/identity/credentials";

export { sessionCookie } from "@/modules/identity/session";
