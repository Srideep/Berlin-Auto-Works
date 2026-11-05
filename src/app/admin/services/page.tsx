import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Service catalog" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Service catalog"
        description="The services customers can book. Publishing a change refreshes the public pages."
        actionHref="/services" actionLabel="View the public catalog"
      />
      <EmptyState
        title="Catalog editing is not connected"
        description="The public site is still reading the launch catalog bundled with the app."
        actionHref="/services"
        actionLabel="View the public catalog"
      />
    </div>
  );
}
