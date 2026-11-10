"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { getAuth, authConfigured } from "@/auth";
import type { ActionState } from "@/lib/action-state";
import { parseFormAction } from "@/lib/form-action";
import {
  registerCustomer,
  requestPasswordReset,
  resetPassword,
} from "@/modules/identity/accounts";
import {
  forgotPasswordSchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "@/modules/identity/credentials";
import { readSignedInUser } from "@/modules/identity/current-session";
import { sendVerificationEmail, verifyEmailToken } from "@/modules/identity/verification";
import { emailConfigured } from "@/modules/notifications/deliver";

const notConfigured: ActionState = {
  status: "unavailable",
  message: "Sign-in is not configured.",
  fieldErrors: {},
};

export async function submitLogin(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction("login", loginSchema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  const auth = getAuth();
  if (!authConfigured() || !auth) {
    return notConfigured;
  }
  try {
    await auth.signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "invalid",
        message: "Email or password is not right.",
        fieldErrors: {},
      };
    }
    throw error;
  }
  return { status: "success", message: "Signed in.", fieldErrors: {} };
}

export async function submitSignup(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction("signup", signupSchema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  const auth = getAuth();
  if (!authConfigured() || !auth) {
    return notConfigured;
  }
  // A new account cannot reach the portal until its email is verified, so
  // production needs a way to send the link before accepting signups.
  if (process.env.NODE_ENV === "production" && !emailConfigured()) {
    return {
      status: "unavailable",
      message: "Account email is not configured, so new accounts cannot be confirmed yet.",
      fieldErrors: {},
    };
  }
  const created = await registerCustomer(parsed.data);
  if (!created.ok) {
    return {
      status: "invalid",
      message: created.message,
      fieldErrors: created.field ? { [created.field]: created.message } : {},
    };
  }
  try {
    await auth.signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "invalid",
        message: "The account was created, but sign-in did not start.",
        fieldErrors: {},
      };
    }
    throw error;
  }
  return { status: "success", message: "Account created.", fieldErrors: {} };
}

export async function submitForgotPassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction("forgotPassword", forgotPasswordSchema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  if (!authConfigured() || !emailConfigured()) {
    return {
      status: "unavailable",
      message: "Password reset email is not configured.",
      fieldErrors: {},
    };
  }
  await requestPasswordReset(parsed.data.email);
  return {
    status: "success",
    message: "If an account exists for that email, a reset link is on its way.",
    fieldErrors: {},
  };
}

export async function submitResetPassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction("resetPassword", resetPasswordSchema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  if (!authConfigured()) {
    return notConfigured;
  }
  const reset = await resetPassword(parsed.data);
  if (!reset.ok) {
    return {
      status: "invalid",
      message: reset.message,
      fieldErrors: { token: reset.message },
    };
  }
  return {
    status: "success",
    message: "Password updated. Sign in with the new password.",
    fieldErrors: {},
  };
}

export async function submitVerifyEmail(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction("verifyEmail", verifyEmailSchema, formData);
  if (!parsed.ok) {
    return parsed.state;
  }
  if (!authConfigured()) {
    return notConfigured;
  }
  const verified = await verifyEmailToken(parsed.data.token);
  if (!verified.ok) {
    return {
      status: "invalid",
      message: verified.message,
      fieldErrors: { token: verified.message },
    };
  }
  // Outside any try block: redirect() throws to end the action. A visitor who
  // is not signed in is sent on from /account to /login.
  redirect("/account");
}

export async function submitResendVerification(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = await parseFormAction(
    "resendVerification",
    resendVerificationSchema,
    formData,
  );
  if (!parsed.ok) {
    return parsed.state;
  }
  if (!authConfigured()) {
    return notConfigured;
  }
  const user = await readSignedInUser();
  if (!user) {
    return {
      status: "invalid",
      message: "Sign in to get a new confirmation link.",
      fieldErrors: {},
    };
  }
  if (user.emailVerified) {
    redirect("/account");
  }
  await sendVerificationEmail(user.id);
  return {
    status: "success",
    message: `A new confirmation link is on its way to ${user.email}. Earlier links no longer work.`,
    fieldErrors: {},
  };
}

export async function signOutAction(): Promise<void> {
  const auth = getAuth();
  if (!auth) {
    return;
  }
  await auth.signOut({ redirectTo: "/" });
}
