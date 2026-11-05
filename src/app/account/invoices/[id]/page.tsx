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
      description="Balance and payment. Card details stay with the payment provider."
      actionHref="/account/invoices"
      actionLabel="All invoices"
    />
  );
}
