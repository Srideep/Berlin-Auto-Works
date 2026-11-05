import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";

export const metadata: Metadata = {
  title: "Fleet maintenance",
  description: "Scheduled maintenance and repair for work vehicles in Berlin, New Jersey.",
};

export default async function FleetPage() {
  "use cache";
  cacheLife("marketing");

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Fleet maintenance</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        Work trucks and vans get the same written estimates, repair updates, and
        invoices as a personal car. Tell us how many vehicles you run and how you
        want to be reached. A dedicated fleet portal comes later.
      </p>
      <Link
        href="/contact"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-5 font-semibold text-white hover:bg-copper-dark"
      >
        Talk with the shop
      </Link>
    </article>
  );
}
