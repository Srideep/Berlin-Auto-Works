import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Hours" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hours"
        description="Weekly hours and days the shop is closed, per location."
        actionHref="/contact" actionLabel="View public hours"
      />
      <EmptyState
        title="Hours editing is not connected"
        description="The public contact page still shows the placeholder hours."
        actionHref="/contact"
        actionLabel="View public hours"
      />
    </div>
  );
}
