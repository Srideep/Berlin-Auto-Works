import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Vehicles" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        description="Cars and trucks saved on your account."
        actionHref="/account/vehicles/new" actionLabel="Add a vehicle"
      />
      <EmptyState
        title="No vehicles yet"
        description="Add a vehicle once sign-in is connected, or book as a guest in the meantime."
        actionHref="/account/vehicles/new"
        actionLabel="Add a vehicle"
      />
    </div>
  );
}
