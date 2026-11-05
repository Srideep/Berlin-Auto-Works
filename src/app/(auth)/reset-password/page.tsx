import type { Metadata } from "next";

import { PreviewForm } from "@/components/forms/preview-form";

import { submitResetPassword } from "../actions";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-medium text-ink">Reset password</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          Reset links are not issued yet. The new password is checked and then discarded.
        </p>
      </div>
      <PreviewForm
        formId="reset-password"
        action={submitResetPassword}
        submitLabel="Update password"
        sections={[
          {
            title: "New password",
            description: "Paste the token from the reset email when that email exists.",
            fields: [
              {
                name: "token",
                label: "Reset token",
                type: "text",
                required: true,
                autoComplete: "off",
              },
              {
                name: "password",
                label: "New password",
                type: "password",
                required: true,
                autoComplete: "new-password",
              },
            ],
          },
        ]}
      />
    </div>
  );
}
