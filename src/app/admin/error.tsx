"use client";

interface AdminErrorProps {
  reset: () => void;
}

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-card p-6">
      <h2 className="text-2xl font-medium text-ink">The workspace page did not load.</h2>
      <p className="text-base leading-7 text-muted">
        Try again. The error detail stays on the server.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper"
      >
        Try again
      </button>
    </div>
  );
}
