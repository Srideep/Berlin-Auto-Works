import Link from "next/link";
import { cacheLife } from "next/cache";

import { serviceOfferings } from "@/modules/catalog/services";
import {
  formatShopAddress,
  launchShopProfile,
} from "@/modules/locations/profile";

export default async function HomePage() {
  "use cache";
  cacheLife("marketing");

  const shop = launchShopProfile;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: shop.brand,
    description: shop.tagline,
    telephone: shop.phoneTel,
    email: shop.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.addressLine1,
      addressLocality: shop.city,
      addressRegion: shop.region,
      postalCode: shop.postalCode,
      addressCountry: "US",
    },
    openingHours: ["Mo-Fr 08:00-18:00", "Sa 08:00-15:00"],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
            Berlin, New Jersey
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-medium leading-tight tracking-tight text-ink sm:text-6xl">
            {shop.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
            Maintenance, diagnostics, and repairs with a written estimate before
            the work starts. You can book as a guest or from your account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-5 font-semibold text-white hover:bg-copper-dark"
            >
              Book service
            </Link>
            <Link
              href="/estimate"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-card px-5 font-semibold text-ink hover:border-copper"
            >
              Request an estimate
            </Link>
          </div>
        </div>
        <aside className="rounded-3xl bg-pine px-5 py-6 text-paper">
          <h2 className="font-display text-2xl">Shop hours</h2>
          <dl className="mt-4 space-y-2 text-sm leading-6">
            {shop.hours.map((row) => (
              <div key={row.days} className="flex items-baseline justify-between gap-4">
                <dt>{row.days}</dt>
                <dd className="text-right">{row.hours}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-6 text-paper/80">
            {formatShopAddress(shop)}
          </p>
          <p className="text-sm">
            <a href={`tel:${shop.phoneTel}`} className="underline">
              {shop.phoneDisplay}
            </a>
          </p>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16" aria-labelledby="services-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="services-heading" className="text-3xl font-medium text-ink">
            What we work on
          </h2>
          <Link href="/services" className="text-sm font-semibold text-copper hover:text-copper-dark">
            All services
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceOfferings.slice(0, 6).map((service) => (
            <li key={service.slug} className="rounded-2xl border border-line bg-card p-5">
              <h3 className="font-display text-xl text-ink">{service.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{service.summary}</p>
              <Link
                href={`/services/${service.slug}`}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-copper"
              >
                Read more
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
