import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Appointments" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Requested, confirmed, and completed visits for this location."
        
      />
      <EmptyState
        title="No appointments in the queue"
        description="New requests will land here. The list is scoped to the staff member's location."
        
      />
    </div>
  );
}
