import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "New estimate" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New estimate"
        description="Labor, parts, and the note the customer will see."
        actionHref="/admin/estimates" actionLabel="Back to estimates"
      />
      <EmptyState
        title="Estimate composition is not connected"
        description="Internal notes and the customer-facing note are separate fields. This screen does not save either one yet."
        actionHref="/admin/estimates"
        actionLabel="Back to estimates"
      />
    </div>
  );
}
