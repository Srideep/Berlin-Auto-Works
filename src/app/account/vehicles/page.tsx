import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db";
import { requireCustomer } from "@/modules/identity/current-session";

export const instant = false;

export const metadata: Metadata = { title: "Vehicles" };

export default async function Page() {
  const customer = await requireCustomer();
  const vehicles = customer
    ? await getDb().vehicle.findMany({
        where: { customerId: customer.customerId },
        orderBy: [{ year: "desc" }, { make: "asc" }, { model: "asc" }],
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          licensePlate: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        description="Cars and trucks saved on your account."
        actionHref="/account/vehicles/new"
        actionLabel="Add a vehicle"
      />
      {vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles yet"
          description={
            customer
              ? "Add a car or truck and it stays on this account."
              : "Add a vehicle once sign-in is connected, or book as a guest in the meantime."
          }
          actionHref="/account/vehicles/new"
          actionLabel="Add a vehicle"
        />
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <Link
                href={`/account/vehicles/${vehicle.id}`}
                className="flex min-h-14 items-center justify-between gap-4 px-4 text-sm"
              >
                <span className="font-semibold text-ink">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
                <span className="text-copper">{vehicle.licensePlate ?? "Details"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
