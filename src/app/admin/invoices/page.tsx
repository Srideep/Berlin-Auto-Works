import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Invoices" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Open, processing, and paid invoices."
        
      />
      <EmptyState
        title="No invoices"
        description="Payments are confirmed by the provider. This list does not mark anything paid on its own."
        
      />
    </div>
  );
}
