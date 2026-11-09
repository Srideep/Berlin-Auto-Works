import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { LegalDocument } from "@/components/marketing/legal-document";
import { getPublicShop } from "@/modules/locations/public-shop";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility contact for the Berlin AutoWorks website.",
};

export default async function AccessibilityPage() {
  "use cache";
  cacheLife("legal");

  const shop = await getPublicShop();

  return (
    <LegalDocument title="Accessibility">
      <p>
        {shop.brand} aims for WCAG 2.2 Level AA on the public site
        and the customer portal. Pages use headings, labels, and visible focus.
      </p>
      <p>
        If something on this site blocks you, email {shop.email} or call{" "}
        {shop.phoneDisplay}.
      </p>
    </LegalDocument>
  );
}
