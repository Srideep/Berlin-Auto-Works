export const notificationTemplates = [
  "booking_received",
  "estimate_received",
  "estimate_sent",
  "repair_status",
  "invoice_ready",
  "password_reset",
  "email_verification",
] as const;

export type NotificationTemplate = (typeof notificationTemplates)[number];

export interface EmailNotification {
  to: string;
  template: NotificationTemplate;
  locationId: string;
  subjectId: string;
}
