import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Repairs" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repairs"
        description="Work in progress and recent repair orders."
        
      />
      <EmptyState
        title="No repairs in progress"
        description="Status updates that are meant for you will show up here. Internal shop notes stay off this page."
        
      />
    </div>
  );
}
