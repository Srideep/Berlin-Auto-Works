export interface ShopHours {
  days: string;
  hours: string;
}

export interface ShopProfile {
  slug: string;
  brand: string;
  tagline: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  hours: readonly ShopHours[];
}

/**
 * Launch copy. Public pages load name, address, phone, and email from the
 * active Location row. Tagline and hours stay here until they are columns.
 * This slug is content, not a location id in queries.
 */
export const launchShopProfile = {
  slug: "berlin",
  brand: "Berlin AutoWorks",
  tagline: "Reliable repair. Straight answers. Ready for the road.",
  addressLine1: "123 Route 73",
  city: "Berlin",
  region: "NJ",
  postalCode: "08009",
  phoneDisplay: "(856) 555-0147",
  phoneTel: "+18565550147",
  email: "service@berlinautoworks.example",
  hours: [
    { days: "Monday–Friday", hours: "8:00 AM–6:00 PM" },
    { days: "Saturday", hours: "8:00 AM–3:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],
} as const satisfies ShopProfile;

export function formatShopAddress(profile: ShopProfile): string {
  return `${profile.addressLine1}, ${profile.city}, ${profile.region} ${profile.postalCode}`;
}
