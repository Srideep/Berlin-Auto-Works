import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { launchShopProfile } from "@/modules/locations/profile";

export const metadata: Metadata = {
  title: "About",
  description: "Berlin AutoWorks is a full-service repair shop in Berlin, New Jersey.",
};

export default async function AboutPage() {
  "use cache";
  cacheLife("marketing");

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">About the shop</h1>
      <div className="mt-4 space-y-4 text-lg leading-8 text-muted">
        <p>
          {launchShopProfile.brand} is a full-service repair shop on Route 73 in Berlin,
          New Jersey. The address and phone on this site are placeholders until the
          shop publishes its real details.
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
