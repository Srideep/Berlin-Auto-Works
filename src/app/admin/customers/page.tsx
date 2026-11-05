import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Search people who have vehicles, estimates, or repair orders at this shop."
        
      />
      <EmptyState
        title="No customers loaded"
        description="Customer search stays empty until staff sign-in is connected."
        
      />
    </div>
  );
}
