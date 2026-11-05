import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { PortalNav } from "@/components/layout/portal-nav";
import { PreviewBanner } from "@/components/ui/preview-banner";

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

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/account" className="font-display text-2xl font-medium text-ink">
              Your account
            </Link>
            <Link href="/" className="text-sm font-semibold text-copper">
              Shop site
            </Link>
          </div>
          <PortalNav label="Account" links={links} />
        </div>
      </header>
      <PreviewBanner>
        Customer sign-in is not connected. These pages stay empty and do not load repair records.
      </PreviewBanner>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
