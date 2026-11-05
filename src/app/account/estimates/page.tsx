import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Estimates" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimates"
        description="Estimates waiting on your decision."
        actionHref="/estimate" actionLabel="Request an estimate"
      />
      <EmptyState
        title="No estimates"
        description="When the shop sends an estimate, approve, decline, or ask for changes from here."
        actionHref="/estimate"
        actionLabel="Request an estimate"
      />
    </div>
  );
}
