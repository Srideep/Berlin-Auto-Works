import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Add a vehicle" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add a vehicle"
        description="Year, make, model, and plate. A VIN can wait."
        actionHref="/account/vehicles" actionLabel="Back to vehicles"
      />
      <EmptyState
        title="Adding a vehicle is not connected"
        description="This screen is ready for the form. It does not save a vehicle yet."
        actionHref="/account/vehicles"
        actionLabel="Back to vehicles"
      />
    </div>
  );
}
