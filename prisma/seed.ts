import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { serviceOfferings } from "../src/modules/catalog/services";
import { launchShopProfile } from "../src/modules/locations/profile";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main(): Promise<void> {
  const location = await prisma.location.upsert({
    where: { slug: launchShopProfile.slug },
    update: {
      name: launchShopProfile.brand,
      addressLine1: launchShopProfile.addressLine1,
      city: launchShopProfile.city,
      region: launchShopProfile.region,
      postalCode: launchShopProfile.postalCode,
      countryCode: "US",
      phone: launchShopProfile.phoneDisplay,
      email: launchShopProfile.email,
      timezone: "America/New_York",
      isActive: true,
    },
    create: {
      slug: launchShopProfile.slug,
      name: launchShopProfile.brand,
      addressLine1: launchShopProfile.addressLine1,
      city: launchShopProfile.city,
      region: launchShopProfile.region,
      postalCode: launchShopProfile.postalCode,
      countryCode: "US",
      phone: launchShopProfile.phoneDisplay,
      email: launchShopProfile.email,
      timezone: "America/New_York",
      isActive: true,
    },
  });

  for (const [sortOrder, offering] of serviceOfferings.entries()) {
    await prisma.service.upsert({
      where: {
        locationId_slug: {
          locationId: location.id,
          slug: offering.slug,
        },
      },
      update: {
        name: offering.name,
        summary: offering.summary,
        details: offering.details,
        sortOrder,
        isPublished: true,
      },
      create: {
        locationId: location.id,
        slug: offering.slug,
        name: offering.name,
        summary: offering.summary,
        details: offering.details,
        sortOrder,
        isPublished: true,
      },
    });
  }

  const services = await prisma.service.findMany({
    where: { locationId: location.id },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  console.log(
    `Seeded location ${location.slug} (${location.name}) with ${services.length} services: ${services.map((service) => service.slug).join(", ")}.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
