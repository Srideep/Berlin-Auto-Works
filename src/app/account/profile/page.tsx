import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { formatUsPhoneDisplay, parseUsPhoneDigits } from "@/lib/phone";
import { requireCustomer } from "@/modules/identity/current-session";

export const instant = false;

export const metadata: Metadata = { title: "Profile" };

function displayPhone(phone: string | null): { text: string; href: string | null } {
  if (!phone) {
    return { text: "Not on file", href: null };
  }
  const digits = parseUsPhoneDigits(phone);
  if (digits.length === 10) {
    return { text: formatUsPhoneDisplay(digits), href: `tel:+1${digits}` };
  }
  const trimmed = phone.trim();
  return {
    text: trimmed.length > 0 ? trimmed : "Not on file",
    href: trimmed.length > 0 ? `tel:${trimmed}` : null,
  };
}

export default async function Page() {
  const customer = await requireCustomer();
  const profile = customer
    ? await getDb().customer.findUnique({
        where: { id: customer.customerId },
        select: { name: true, email: true, phone: true },
      })
    : null;

  const name = profile?.name ?? customer?.name ?? "";
  const email = profile?.email ?? customer?.email ?? "";
  const phone = displayPhone(profile?.phone ?? null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Name, contact details, and how you want to be notified."
        actionHref={customer ? undefined : "/login"}
        actionLabel={customer ? undefined : "Sign in"}
      />
      {customer ? (
        <dl className="space-y-4 rounded-2xl border border-line bg-card p-5 text-base leading-7">
          <div>
            <dt className="font-semibold text-ink">Name</dt>
            <dd className="text-muted">{name}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Email</dt>
            <dd>
              <a href={`mailto:${email}`} className="text-copper underline">
                {email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Phone</dt>
            <dd className="text-muted">
              {phone.href ? (
                <a href={phone.href} className="text-copper underline">
                  {phone.text}
                </a>
              ) : (
                phone.text
              )}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Notifications</dt>
            <dd className="text-muted">
              The shop emails {email} about appointments, estimates, and invoices.
            </dd>
          </div>
        </dl>
      ) : (
        <EmptyState
          title="Profile is not loaded"
          description="Sign-in is not connected, so this page does not show personal details."
          actionHref="/login"
          actionLabel="Sign in"
        />
      )}
    </div>
  );
}
