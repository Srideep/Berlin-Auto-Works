import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { createToken, hashToken } from "@/modules/identity/password";
import { emailConfigured } from "@/modules/notifications/deliver";
import { enqueueEmail } from "@/modules/notifications/queue";

const verificationTtlMs = 24 * 60 * 60 * 1000;

/**
 * Records proof that the user controls their email, then links the account to
 * the Customer with that email, creating one if none exists. An existing
 * Customer's name and phone are left as they are.
 *
 * Every path that proves email control (a verification link or a password
 * reset link) goes through here, so a User is only ever linked to customer
 * records after that proof.
 */
export async function markEmailVerified(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, name: true, emailVerifiedAt: true, customerId: true },
  });
  const customerId =
    user.customerId ??
    (
      await tx.customer.upsert({
        where: { email: user.email },
        update: {},
        create: { email: user.email, name: user.name },
        select: { id: true },
      })
    ).id;
  await tx.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      customerId,
    },
  });
  await tx.emailVerificationToken.deleteMany({ where: { userId } });
}

/**
 * Replaces any outstanding verification link with a new one and emails it.
 * Without an email provider, development builds log the link instead so the
 * flow can be exercised locally. Production never logs it.
 */
export async function sendVerificationEmail(userId: string): Promise<void> {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user || user.emailVerifiedAt) {
    return;
  }

  const token = createToken();
  await db.$transaction([
    db.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    db.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + verificationTtlMs),
      },
    }),
  ]);

  const verifyUrl = new URL("/verify-email", getSiteUrl());
  verifyUrl.searchParams.set("token", token);

  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`Email is not configured. Verification link: ${verifyUrl.toString()}`);
    }
    return;
  }

  try {
    await enqueueEmail({
      to: user.email,
      template: "email_verification",
      locationId: "account",
      subjectId: user.id,
      subject: "Confirm your Berlin AutoWorks email",
      text: [
        "Confirm this email address to finish setting up your account.",
        "The link works for 24 hours and can be used once.",
        "",
        verifyUrl.toString(),
        "",
        "If you did not create an account, you can ignore the message.",
      ].join("\n"),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : "verification email failed");
  }
}

export async function verifyEmailToken(
  token: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getDb();
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token.trim()) },
    select: { userId: true, expiresAt: true },
  });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return {
      ok: false,
      message: "That confirmation link is invalid or has expired. Sign in to get a new one.",
    };
  }
  await db.$transaction((tx) => markEmailVerified(tx, record.userId));
  return { ok: true };
}
