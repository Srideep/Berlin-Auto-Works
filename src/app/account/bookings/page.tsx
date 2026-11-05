import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Appointments" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Upcoming and past visits."
        actionHref="/account/bookings/new" actionLabel="Book a visit"
      />
      <EmptyState
        title="No appointments"
        description="Book a visit when you are ready. Guest booking is on the public site."
        actionHref="/account/bookings/new"
        actionLabel="Book a visit"
      />
    </div>
  );
}
