import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";

import { serviceOfferings } from "@/modules/catalog/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Maintenance, diagnostics, brakes, tires, and the rest of the work Berlin AutoWorks does.",
};

export default async function ServicesPage() {
  "use cache";
  cacheLife("marketing");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Services</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
        Every job starts with what we found and what it costs. Approve the estimate before we turn a wrench.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {serviceOfferings.map((service) => (
          <li key={service.slug} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="font-display text-2xl text-ink">{service.name}</h2>
            <p className="mt-2 text-base leading-7 text-muted">{service.summary}</p>
            <Link
              href={`/services/${service.slug}`}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-copper"
            >
              Service details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
