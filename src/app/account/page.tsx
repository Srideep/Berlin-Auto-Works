import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Upcoming appointments, open estimates, active repairs, and unpaid invoices."
        actionHref="/book" actionLabel="Book service"
      />
      <EmptyState
        title="Nothing scheduled"
        description="When your account is connected, today and the open work will show up here."
        actionHref="/book"
        actionLabel="Book service"
      />
    </div>
  );
}
