import Link from "next/link";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-copper">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-base leading-7 text-muted">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-4 text-sm font-semibold text-white hover:bg-copper-dark"
        >
          {actionLabel}
        </Link>
      ) : null}
    </header>
  );
}
