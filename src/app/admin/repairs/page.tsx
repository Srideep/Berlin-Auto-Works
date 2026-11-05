import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Repair orders" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair orders"
        description="Intake through pickup for this location."
        actionHref="/admin/repairs/new" actionLabel="New repair order"
      />
      <EmptyState
        title="No repair orders"
        description="Create one from an approved estimate or a walk-in once the workspace is connected."
        actionHref="/admin/repairs/new"
        actionLabel="New repair order"
      />
    </div>
  );
}
