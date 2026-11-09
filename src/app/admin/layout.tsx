import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { SignOutButton } from "@/components/account/sign-out-button";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { authConfigured } from "@/auth";
import { requireStaff } from "@/modules/identity/current-session";
import { staffRoleLabels } from "@/modules/identity/roles";

export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "Shop workspace",
    template: "%s · Shop workspace",
  },
};

const links = [
  { href: "/admin", label: "Today" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/estimates", label: "Estimates" },
  { href: "/admin/repairs", label: "Repair orders" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/hours", label: "Hours" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit log" },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await connection();
  const staff = await requireStaff();

  return (
    <div className="flex min-h-full flex-col md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-card md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <Link href="/admin" className="font-display text-2xl font-medium text-ink">
            Shop workspace
          </Link>
          <p className="mt-2 text-xs leading-5 text-muted">
            Roles: {Object.values(staffRoleLabels).join(", ")}.
            {staff ? ` Signed in as ${staff.user.name}.` : " Sign-in is not configured."}
          </p>
          {staff ? (
            <div className="mt-3">
              <SignOutButton />
            </div>
          ) : null}
        </div>
        <nav aria-label="Workspace" className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-ink hover:bg-paper hover:text-copper md:rounded-xl"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        {authConfigured() ? null : (
          <PreviewBanner>
            Staff sign-in is not configured. Lists stay empty so customer records are not shown.
          </PreviewBanner>
        )}
        <main id="main" className="flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
