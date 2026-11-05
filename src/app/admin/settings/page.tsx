import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Location profile, notifications, and integrations."
        
      />
      <EmptyState
        title="Settings are not connected"
        description="Nothing here changes the live shop profile yet."
        
      />
    </div>
  );
}
