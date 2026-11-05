import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Repair order" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Repair order"
      recordId={id}
      description="Status, labor, parts, internal notes, and photos."
      actionHref="/admin/repairs"
      actionLabel="Repair orders"
    />
  );
}
