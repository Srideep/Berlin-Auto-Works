import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card px-5 py-8">
      <h2 className="text-xl font-medium text-ink">{title}</h2>
      <p className="mt-2 max-w-xl text-base leading-7 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-paper hover:bg-pine"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
