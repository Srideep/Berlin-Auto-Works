import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "New repair order" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New repair order"
        description="Start from an approved estimate or a walk-in."
        actionHref="/admin/repairs" actionLabel="Back to repair orders"
      />
      <EmptyState
        title="Creating a repair order is not connected"
        description="The repair order will carry the location, customer, and vehicle. Nothing is written from this screen yet."
        actionHref="/admin/repairs"
        actionLabel="Back to repair orders"
      />
    </div>
  );
}
