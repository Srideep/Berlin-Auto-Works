import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Calendar" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Bay schedule for the shop. Availability is never cached."
        actionHref="/admin/appointments" actionLabel="Open the queue"
      />
      <EmptyState
        title="No appointments on the calendar"
        description="The calendar will fill in when staff sign-in and the schedule are connected."
        actionHref="/admin/appointments"
        actionLabel="Open the queue"
      />
    </div>
  );
}
