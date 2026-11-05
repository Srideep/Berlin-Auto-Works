import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Book a visit" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a visit"
        description="The account booking path. Guest booking stays on the public site."
        actionHref="/book" actionLabel="Book as a guest"
      />
      <EmptyState
        title="Account booking is not connected"
        description="Sign-in has to come first. You can still request a time as a guest."
        actionHref="/book"
        actionLabel="Book as a guest"
      />
    </div>
  );
}
