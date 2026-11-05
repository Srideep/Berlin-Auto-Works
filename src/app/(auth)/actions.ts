"use server";

import type { ActionState } from "@/lib/action-state";
import { runPreviewAction } from "@/lib/form-action";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/modules/identity/credentials";

export async function submitLogin(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runPreviewAction("login", loginSchema, formData);
}

export async function submitSignup(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runPreviewAction("signup", signupSchema, formData);
}

export async function submitForgotPassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runPreviewAction("forgotPassword", forgotPasswordSchema, formData);
}

export async function submitResetPassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runPreviewAction("resetPassword", resetPasswordSchema, formData);
}
