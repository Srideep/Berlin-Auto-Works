import Link from "next/link";

import { formatShopAddress, launchShopProfile } from "@/modules/locations/profile";

export function SiteFooter() {
  const shop = launchShopProfile;

  return (
    <footer className="mt-auto border-t border-line bg-pine text-paper">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl">{shop.brand}</p>
          <p className="mt-2 text-sm leading-6 text-paper/80">{shop.tagline}</p>
        </div>
        <div className="text-sm leading-6">
          <p>{formatShopAddress(shop)}</p>
          <p>
            <a href={`tel:${shop.phoneTel}`} className="underline decoration-paper/40">
              {shop.phoneDisplay}
            </a>
          </p>
          <p>
            <a href={`mailto:${shop.email}`} className="underline decoration-paper/40">
              {shop.email}
            </a>
          </p>
        </div>
        <nav aria-label="Policies" className="flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="underline decoration-paper/40">
            Privacy
          </Link>
          <Link href="/terms" className="underline decoration-paper/40">
            Terms
          </Link>
          <Link href="/accessibility" className="underline decoration-paper/40">
            Accessibility
          </Link>
          <Link href="/login" className="underline decoration-paper/40">
            Customer sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
