import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { getPublicShop } from "@/modules/locations/public-shop";

export const metadata: Metadata = {
  title: "About",
  description: "Berlin AutoWorks is a full-service repair shop in Berlin, New Jersey.",
};

export default async function AboutPage() {
  "use cache";
  cacheLife("marketing");

  const shop = await getPublicShop();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">About the shop</h1>
      <div className="mt-4 space-y-4 text-lg leading-8 text-muted">
        <p>
          {shop.brand} is a full-service repair shop at {shop.addressLine1} in{" "}
          {shop.city}, {shop.region}. The address and phone on the contact page
          come from the shop record.
        </p>
        <p>
          The work is ordinary and specific: maintenance, diagnostics, brakes, tires,
          and the repairs that follow a written estimate. You see the finding before
          anyone starts the job.
        </p>
        <p>
          One location is open at launch. The records behind the counter already
          carry a location, so a second shop does not require a new data model.
        </p>
      </div>
    </article>
  );
}
