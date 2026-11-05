export const repairOrderStatuses = [
  "intake",
  "diagnosis",
  "waiting_parts",
  "in_progress",
  "quality_check",
  "ready",
  "delivered",
  "on_hold",
  "cancelled",
] as const;

export type RepairOrderStatusName = (typeof repairOrderStatuses)[number];

/**
 * Customer portal shape. Internal notes and non-customer photos are absent
 * on purpose so a customer query cannot accidentally render them.
 */
export interface CustomerRepairView {
  id: string;
  locationId: string;
  customerId: string;
  vehicleId: string;
  status: RepairOrderStatusName;
  customerSummary: string | null;
}
