import type { Metadata } from "next";

import { PreviewForm } from "@/components/forms/preview-form";

import { submitResetPassword } from "../actions";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-medium text-ink">Reset password</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          Choose a new password. This link works once.
        </p>
      </div>
      <PreviewForm
        formId="reset-password"
        action={submitResetPassword}
        submitLabel="Update password"
        sections={[
          {
            title: "New password",
            description: "The token arrives in the reset email. The link fills it in.",
            fields: [
              {
                name: "token",
                label: "Reset token",
                type: "text",
                required: true,
                autoComplete: "off",
                defaultValue: token,
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
