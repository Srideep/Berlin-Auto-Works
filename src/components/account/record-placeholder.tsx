import { parseRecordId } from "@/lib/record-id";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

interface RecordPlaceholderProps {
  title: string;
  recordId: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function RecordPlaceholder({
  title,
  recordId,
  description,
  actionHref,
  actionLabel,
}: RecordPlaceholderProps) {
  const id = parseRecordId(recordId);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preview" title={title} description={description} />
      <EmptyState
        title="No record loaded"
        description={`Sign-in is not connected, so this ${title.toLowerCase()} (${id}) stays empty.`}
        actionHref={actionHref}
        actionLabel={actionLabel}
      />
    </div>
  );
}
