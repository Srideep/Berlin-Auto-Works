import type { Metadata } from "next";
import Link from "next/link";

import { PreviewForm } from "@/components/forms/preview-form";
import { authConfigured } from "@/auth";
import { readSignedInUser } from "@/modules/identity/current-session";

import { submitResendVerification, submitVerifyEmail } from "../actions";

// Reads the session and the link token, so it renders per request.
export const instant = false;

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  // A link from the email: confirm with a button press rather than on page
  // load, so a mail scanner that prefetches the link does not use it up.
  if (token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-medium text-ink">Confirm your email</h1>
          <p className="mt-2 text-base leading-7 text-muted">
            Confirming links this account to the bookings, estimates, and invoices
            made with this email.
          </p>
        </div>
        <PreviewForm
          formId="verify-email"
          action={submitVerifyEmail}
          submitLabel="Confirm email"
          sections={[
            {
              title: "Confirmation",
              description: "The link in the email fills this in. It works once.",
              fields: [
                {
                  name: "token",
                  label: "Confirmation code",
                  type: "text",
                  required: true,
                  autoComplete: "off",
                  defaultValue: token,
                },
              ],
            },
          ]}
        />
      </div>
    );
  }

  const user = authConfigured() ? await readSignedInUser() : null;

  if (user && !user.emailVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-medium text-ink">Check your email</h1>
          <p className="mt-2 text-base leading-7 text-muted">
            We sent a confirmation link to {user.email}. Your account shows your
            vehicles, estimates, and invoices once the email is confirmed.
          </p>
        </div>
        <PreviewForm
          formId="resend-verification"
          action={submitResendVerification}
          submitLabel="Send a new link"
          sections={[]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-medium text-ink">Verify email</h1>
      <p className="text-base leading-7 text-muted">
        {user
          ? "Your email is confirmed."
          : "Open the confirmation link from your email, or sign in to get a new one."}
      </p>
      <Link
        href={user ? "/account" : "/login"}
        className="inline-flex min-h-11 items-center font-semibold text-copper"
      >
        {user ? "Go to your account" : "Sign in"}
      </Link>
    </div>
  );
}
