import type { Metadata } from "next";
import Link from "next/link";

import { PreviewForm } from "@/components/forms/preview-form";

import { submitSignup } from "../actions";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-medium text-ink">Create an account</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          Accounts are not stored yet. The form checks the fields and then stops.
        </p>
      </div>
      <PreviewForm
        formId="signup"
        action={submitSignup}
        submitLabel="Create account"
        sections={[
          {
            title: "Your details",
            description: "A password needs at least 12 characters. It is not saved.",
            fields: [
              {
                name: "name",
                label: "Name",
                type: "text",
                required: true,
                autoComplete: "name",
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                required: true,
                autoComplete: "email",
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                required: true,
                autoComplete: "new-password",
              },
            ],
          },
        ]}
      />
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-copper">
          Sign in
        </Link>
      </p>
    </div>
  );
}
