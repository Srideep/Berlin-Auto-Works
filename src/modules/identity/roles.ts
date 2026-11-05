export const staffRoles = ["service_advisor", "technician", "manager"] as const;

export type StaffRole = (typeof staffRoles)[number];

export const staffRoleLabels: Record<StaffRole, string> = {
  service_advisor: "Service advisor",
  technician: "Technician",
  manager: "Manager / owner",
};

const capabilityList = [
  "calendar",
  "appointments",
  "customers",
  "estimates",
  "repairs",
  "invoices",
  "catalog",
  "hours",
  "staff",
  "settings",
  "audit",
] as const;

export type StaffCapability = (typeof capabilityList)[number];

export const staffCapabilities = {
  service_advisor: [
    "calendar",
    "appointments",
    "customers",
    "estimates",
    "repairs",
    "invoices",
  ],
  technician: ["repairs"],
  manager: [...capabilityList],
} as const satisfies Record<StaffRole, readonly StaffCapability[]>;

export function roleHasCapability(
  role: StaffRole,
  capability: StaffCapability,
): boolean {
  return staffCapabilities[role].some((allowed) => allowed === capability);
}
