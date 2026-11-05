import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Estimates" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimates"
        description="Drafts, sent estimates, and decisions."
        actionHref="/admin/estimates/new" actionLabel="New estimate"
      />
      <EmptyState
        title="No estimates in the queue"
        description="Compose an estimate when the queue is connected. Concurrent edits use the version field."
        actionHref="/admin/estimates/new"
        actionLabel="New estimate"
      />
    </div>
  );
}
