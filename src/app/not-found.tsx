import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-4 px-4 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-copper">404</p>
      <h1 className="text-4xl font-medium text-ink">We could not find that page.</h1>
      <p className="text-base leading-7 text-muted">
        The address may be out of date. You can return to the shop or book service.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-4 font-semibold text-white"
        >
          Back to the shop
        </Link>
        <Link
          href="/book"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 font-semibold text-ink"
        >
          Book service
        </Link>
      </div>
    </main>
  );
}
