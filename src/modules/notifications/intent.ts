export const notificationTemplates = [
  "booking_received",
  "estimate_sent",
  "repair_status",
  "invoice_ready",
] as const;

export type NotificationTemplate = (typeof notificationTemplates)[number];

export interface EmailNotification {
  to: string;
  template: NotificationTemplate;
  locationId: string;
  subjectId: string;
}
