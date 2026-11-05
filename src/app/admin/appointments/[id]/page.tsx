import type { Metadata } from "next";

import { RecordPlaceholder } from "@/components/account/record-placeholder";

export const metadata: Metadata = { title: "Appointment" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RecordPlaceholder
      title="Appointment"
      recordId={id}
      description="Visit details for this location."
      actionHref="/admin/appointments"
      actionLabel="Appointment queue"
    />
  );
}
