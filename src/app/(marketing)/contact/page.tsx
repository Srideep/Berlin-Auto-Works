import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { formatShopAddress } from "@/modules/locations/profile";
import { getPublicShop } from "@/modules/locations/public-shop";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hours, phone, and address for Berlin AutoWorks in Berlin, New Jersey.",
};

export default async function ContactPage() {
  "use cache";
  cacheLife("contact");

  const shop = await getPublicShop();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Contact</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        Call, email, or stop by during shop hours.
      </p>
      <dl className="mt-8 space-y-4 rounded-2xl border border-line bg-card p-5 text-base leading-7">
        <div>
          <dt className="font-semibold text-ink">Address</dt>
          <dd className="text-muted">{formatShopAddress(shop)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Phone</dt>
          <dd>
            <a href={`tel:${shop.phoneTel}`} className="text-copper underline">
              {shop.phoneDisplay}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Email</dt>
          <dd>
            <a href={`mailto:${shop.email}`} className="text-copper underline">
              {shop.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Hours</dt>
          <dd>
            <ul className="text-muted">
              {shop.hours.map((row) => (
                <li key={row.days}>
                  {row.days}: {row.hours}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </article>
  );
}
