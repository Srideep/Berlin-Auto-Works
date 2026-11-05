import type { ReactNode } from "react";

interface LegalDocumentProps {
  title: string;
  children: ReactNode;
}

export function LegalDocument({ title, children }: LegalDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">{title}</h1>
      <div className="mt-4 space-y-4 text-base leading-7 text-muted">{children}</div>
    </article>
  );
}
