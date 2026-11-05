"use client";

interface AccountErrorProps {
  reset: () => void;
}

export default function AccountError({ reset }: AccountErrorProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-card p-6">
      <h2 className="text-2xl font-medium text-ink">The account page did not load.</h2>
      <p className="text-base leading-7 text-muted">
        Try again. If it keeps failing, call the shop. Details of the failure stay on the server.
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
