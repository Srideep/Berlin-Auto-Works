import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Audit log" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Estimate decisions, repair status, invoices, role changes, and catalog edits."
        
      />
      <EmptyState
        title="No audit events"
        description="Significant staff actions will append here. The log is for managers and owners."
        
      />
    </div>
  );
}
