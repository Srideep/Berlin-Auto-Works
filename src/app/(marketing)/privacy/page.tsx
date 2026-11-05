import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { LegalDocument } from "@/components/marketing/legal-document";
import { launchShopProfile } from "@/modules/locations/profile";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Berlin AutoWorks handles customer information.",
};

export default async function PrivacyPage() {
  "use cache";
  cacheLife("legal");

  return (
    <LegalDocument title="Privacy">
      <p>
        This is a placeholder privacy notice for {launchShopProfile.brand}. It is
        not legal advice and it will be replaced before the shop collects real
        customer information.
      </p>
      <p>
        Account, appointment, and invoice pages are private. The shop does not
        store card numbers. Payments, when they are connected, stay with the
        payment provider.
      </p>
      <p>
        Questions about personal information can go to {launchShopProfile.email}.
        That address is a placeholder.
      </p>
    </LegalDocument>
  );
}
