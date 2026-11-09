import "server-only";

import { getDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { createToken, hashPassword, hashToken } from "@/modules/identity/password";
import { enqueueEmail } from "@/modules/notifications/queue";
import { emailConfigured } from "@/modules/notifications/deliver";

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string; field?: "email" }> {
  const email = input.email.trim().toLowerCase();
  const db = getDb();
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      ok: false,
      field: "email",
      message: "An account with that email already exists.",
    };
  }
  const customer = await db.customer.upsert({
    where: { email },
    update: { name: input.name.trim() },
    create: { email, name: input.name.trim() },
    select: { id: true },
  });
  await db.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      customerId: customer.id,
    },
  });
  return { ok: true };
}

export async function requestPasswordReset(emailInput: string): Promise<void> {
  if (!emailConfigured()) {
    return;
  }
  const email = emailInput.trim().toLowerCase();
  const user = await getDb().user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
  if (!user) {
    return;
  }
  const token = createToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await getDb().passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });
  const resetUrl = new URL("/reset-password", getSiteUrl());
  resetUrl.searchParams.set("token", token);
  try {
    await enqueueEmail({
    to: user.email,
    template: "password_reset",
    locationId: "account",
    subjectId: user.id,
    subject: "Reset your Berlin AutoWorks password",
    text: [
      "A password reset was requested for this email.",
      "The link works for one hour and can be used once.",
      "",
      resetUrl.toString(),
      "",
      "If you did not ask for this, you can ignore the message.",
    ].join("\n"),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "reset email failed");
  }
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const tokenHash = hashToken(input.token.trim());
  const record = await getDb().passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true },
  });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: "That reset link is invalid or has expired." };
  }
  await getDb().$transaction([
    getDb().user.update({
      where: { id: record.userId },
      data: {
        passwordHash: await hashPassword(input.password),
        tokenVersion: { increment: 1 },
      },
    }),
    getDb().passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return { ok: true };
}
