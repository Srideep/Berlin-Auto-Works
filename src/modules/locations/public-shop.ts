import { cacheLife } from "next/cache";

import { getDb } from "@/lib/db";
import {
  launchShopProfile,
  type ShopProfile,
} from "@/modules/locations/profile";

/**
 * Name, address, phone, and email come from the oldest active Location.
 * Tagline and hours stay in launch copy until those fields are columns.
 * With no DATABASE_URL, public pages keep the launch copy so a build can finish.
 */
export async function getPublicShop(): Promise<ShopProfile> {
  "use cache";
  cacheLife("marketing");

  if (!process.env.DATABASE_URL) {
    return launchShopProfile;
  }

  const location = await getDb().location.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      slug: true,
      name: true,
      addressLine1: true,
      city: true,
      region: true,
      postalCode: true,
      phone: true,
      email: true,
    },
  });

  if (!location) {
    return launchShopProfile;
  }

  return {
    slug: location.slug,
    brand: location.name,
    tagline: launchShopProfile.tagline,
    addressLine1: location.addressLine1,
    city: location.city,
    region: location.region,
    postalCode: location.postalCode,
    phoneDisplay: location.phone,
    phoneTel: phoneToTel(location.phone),
    email: location.email,
    hours: launchShopProfile.hours,
  };
}

function phoneToTel(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return digits.length > 0 ? `+${digits}` : phone;
}
