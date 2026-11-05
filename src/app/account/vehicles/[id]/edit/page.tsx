import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Edit vehicle" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Edit vehicle"
      recordId={id}
      description="Updates to year, make, model, and plate will be saved here."
      actionHref="/account/vehicles"
      actionLabel="All vehicles"
    />
  );
}
