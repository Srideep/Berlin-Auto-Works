import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Estimate" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Estimate"
      recordId={id}
      description="The customer-facing estimate. Internal shop notes are not part of this page."
      actionHref="/account/estimates"
      actionLabel="All estimates"
    />
  );
}
