import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(120);

const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  company: z.string().max(0),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email: emailSchema,
  password: passwordSchema,
  company: z.string().max(0),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  company: z.string().max(0),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "This reset link is incomplete.").max(256),
  password: passwordSchema,
  company: z.string().max(0),
});
