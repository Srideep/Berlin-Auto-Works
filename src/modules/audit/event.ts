export const auditActions = [
  "estimate.sent",
  "estimate.approved",
  "estimate.declined",
  "repair_order.status_changed",
  "invoice.created",
  "invoice.paid",
  "invoice.refunded",
  "staff.role_changed",
  "location.hours_changed",
  "catalog.changed",
] as const;

export type AuditAction = (typeof auditActions)[number];

export interface AuditEvent {
  locationId: string;
  actorId: string;
  action: AuditAction;
  subjectType: string;
  subjectId: string;
  createdAt: string;
}
