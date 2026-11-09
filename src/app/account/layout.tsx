import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { SignOutButton } from "@/components/account/sign-out-button";
import { PortalNav } from "@/components/layout/portal-nav";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { authConfigured } from "@/auth";
import { requireCustomer } from "@/modules/identity/current-session";

export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "Your account",
    template: "%s · Your account",
  },
};

const links = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/vehicles", label: "Vehicles" },
  { href: "/account/bookings", label: "Appointments" },
  { href: "/account/estimates", label: "Estimates" },
  { href: "/account/repairs", label: "Repairs" },
  { href: "/account/invoices", label: "Invoices" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
] as const;

export default async function AccountLayout({ children }: { children: ReactNode }) {
  await connection();
  const customer = await requireCustomer();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/account" className="font-display text-2xl font-medium text-ink">
              Your account
            </Link>
            <div className="flex items-center gap-4">
              {customer ? <SignOutButton /> : null}
              <Link href="/" className="text-sm font-semibold text-copper">
                Shop site
              </Link>
            </div>
          </div>
          <PortalNav label="Account" links={links} />
        </div>
      </header>
      {authConfigured() ? null : (
        <PreviewBanner>
          Customer sign-in is not configured. These pages stay empty and do not load repair records.
        </PreviewBanner>
      )}
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
