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
      description="Edit and send the estimate. Save conflicts if the version changed."
      actionHref="/admin/estimates"
      actionLabel="Estimate queue"
    />
  );
}
