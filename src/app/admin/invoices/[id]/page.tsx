import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Invoice" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Invoice"
      recordId={id}
      description="Send the invoice or record a provider payment. Refunds are a manager action."
      actionHref="/admin/invoices"
      actionLabel="All invoices"
    />
  );
}
