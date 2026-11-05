import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Staff" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="People who can sign in, and the role they hold at this location."
        
      />
      <EmptyState
        title="No staff memberships loaded"
        description="Roles are service advisor, technician, and manager or owner. A person belongs to a location."
        
      />
    </div>
  );
}
