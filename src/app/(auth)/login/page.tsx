import type { Metadata } from "next";
import Link from "next/link";

import { PreviewForm } from "@/components/forms/preview-form";

import { submitLogin } from "../actions";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-medium text-ink">Sign in</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          Customer sign-in is not connected. This form is rate-limited and does not create a session.
        </p>
      </div>
      <PreviewForm
        formId="login"
        action={submitLogin}
        submitLabel="Sign in"
        sections={[
          {
            title: "Account",
            description: "Use the email on your repair records.",
            fields: [
              {
                name: "email",
                label: "Email",
                type: "email",
                required: true,
                autoComplete: "username",
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                required: true,
                autoComplete: "current-password",
              },
            ],
          },
        ]}
      />
      <p className="text-sm leading-6 text-muted">
        <Link href="/forgot-password" className="font-semibold text-copper">
          Forgot password
        </Link>
        {" · "}
        <Link href="/signup" className="font-semibold text-copper">
          Create an account
        </Link>
      </p>
    </div>
  );
}
