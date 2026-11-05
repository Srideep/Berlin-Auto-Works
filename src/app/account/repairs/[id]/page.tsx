import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Repair" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Repair"
      recordId={id}
      description="Customer-visible status and photos only. Internal notes stay in the shop workspace."
      actionHref="/account/repairs"
      actionLabel="All repairs"
    />
  );
}
