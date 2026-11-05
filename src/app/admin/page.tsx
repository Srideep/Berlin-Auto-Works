import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Today" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Today"
        description="Appointments on the board, estimates waiting on a customer, repairs that are blocked, and overdue invoices."
        actionHref="/admin/appointments" actionLabel="Appointment queue"
      />
      <EmptyState
        title="The board is clear"
        description="Staff sign-in is not connected, so today's work is not loaded."
        actionHref="/admin/appointments"
        actionLabel="Appointment queue"
      />
    </div>
  );
}
