import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Customer" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Customer"
      recordId={id}
      description="Profile, vehicles, and history for this customer at this location."
      actionHref="/admin/customers"
      actionLabel="All customers"
    />
  );
}
