import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-medium text-ink">Verify email</h1>
      <p className="text-base leading-7 text-muted">
        Email verification is not connected. When it is, this page will confirm a
        link sent to the address on the account. No inbox is checked from here.
      </p>
      <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-copper">
        Back to sign in
      </Link>
    </div>
  );
}
