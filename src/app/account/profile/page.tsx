import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Name, contact details, and how you want to be notified."
        actionHref="/login" actionLabel="Sign in"
      />
      <EmptyState
        title="Profile is not loaded"
        description="Sign-in is not connected, so this page does not show personal details."
        actionHref="/login"
        actionLabel="Sign in"
      />
    </div>
  );
}
