import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Invoices" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Balances and paid invoices."
        
      />
      <EmptyState
        title="No invoices"
        description="When a balance is due, you will pay it here through the payment provider. Card numbers never come to this site."
        
      />
    </div>
  );
}
