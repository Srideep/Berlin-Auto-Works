import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { LegalDocument } from "@/components/marketing/legal-document";
import { launchShopProfile } from "@/modules/locations/profile";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the Berlin AutoWorks website.",
};

export default async function TermsPage() {
  "use cache";
  cacheLife("legal");

  return (
    <LegalDocument title="Terms of use">
      <p>
        This website describes {launchShopProfile.brand} and, when the shop opens
        booking, lets a customer request service or an estimate. An estimate is
        not an agreement until the customer approves it.
      </p>
      <p>
        Placeholder hours, address, and phone numbers are not a promise of
        availability. The shop confirms an appointment before it is final.
      </p>
      <p>These terms are a draft for the product scaffold and need a legal review.</p>
    </LegalDocument>
  );
}
