import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Vehicle" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Vehicle"
      recordId={id}
      description="Service history for this vehicle will appear here."
      actionHref="/account/vehicles"
      actionLabel="All vehicles"
    />
  );
}
