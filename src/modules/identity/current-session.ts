import "server-only";

import { forbidden, redirect } from "next/navigation";

import { authConfigured, getAuth } from "@/auth";
import { getDb } from "@/lib/db";
import { getActiveLocation } from "@/modules/locations/active";
import type { StaffRole } from "@/modules/identity/roles";

export interface SignedInUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  customerId: string | null;
}

export async function readSignedInUser(): Promise<SignedInUser | null> {
  if (!authConfigured()) {
    return null;
  }
  const auth = getAuth();
  if (!auth) {
    return null;
  }
  const session = await auth.auth();
  if (!session?.user.id) {
    return null;
  }
  const user = await getDb().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      tokenVersion: true,
      emailVerifiedAt: true,
      customerId: true,
    },
  });
  if (!user || user.tokenVersion !== session.user.tokenVersion) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerifiedAt !== null,
    customerId: user.customerId,
  };
}

export async function requireCustomer(): Promise<SignedInUser & { customerId: string } | null> {
  if (!authConfigured()) {
    return null;
  }
  const user = await readSignedInUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.emailVerified) {
    redirect("/verify-email");
  }
  if (!user.customerId) {
    redirect("/login");
  }
  return { ...user, customerId: user.customerId };
}

export interface StaffContext {
  user: SignedInUser;
  locationId: string;
  role: StaffRole;
}

export async function requireStaff(): Promise<StaffContext | null> {
  if (!authConfigured()) {
    return null;
  }
  const user = await readSignedInUser();
  if (!user) {
    redirect("/login");
  }
  // Staff access comes from a membership matched by email, so it is only
  // honoured once the user has proved they control that email.
  if (!user.emailVerified) {
    redirect("/verify-email");
  }
  const location = await getActiveLocation();
  if (!location) {
    forbidden();
  }
  const membership = await getDb().staffMembership.findFirst({
    where: {
      locationId: location.id,
      email: { equals: user.email, mode: "insensitive" },
    },
    select: { role: true },
  });
  if (!membership) {
    forbidden();
  }
  return { user, locationId: location.id, role: membership.role };
}
