import type { Metadata } from "next";
import Link from "next/link";

import { PreviewForm } from "@/components/forms/preview-form";

import { submitForgotPassword } from "../actions";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-medium text-ink">Forgot password</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          If the email matches an account, we send a one-time reset link.
        </p>
      </div>
      <PreviewForm
        formId="forgot-password"
        action={submitForgotPassword}
        submitLabel="Request reset"
        sections={[
          {
            title: "Email",
            description: "Use the address on the account.",
            fields: [
              {
                name: "email",
                label: "Email",
                type: "email",
                required: true,
                autoComplete: "email",
              },
            ],
          },
        ]}
      />
      <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-semibold text-copper">
        Back to sign in
      </Link>
    </div>
  );
}
