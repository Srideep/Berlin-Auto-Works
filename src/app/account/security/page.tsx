import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Security" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Password and sessions."
        actionHref="/forgot-password" actionLabel="Forgot password"
      />
      <EmptyState
        title="Security settings are not connected"
        description="Password changes and session revoke will live here. Nothing is stored from this preview."
        actionHref="/forgot-password"
        actionLabel="Forgot password"
      />
    </div>
  );
}
