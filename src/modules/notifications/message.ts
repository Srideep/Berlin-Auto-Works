import type { NotificationTemplate } from "@/modules/notifications/intent";

export interface OutboundEmail {
  to: string;
  template: NotificationTemplate;
  locationId: string;
  subjectId: string;
  text: string;
  subject: string;
}

const subjects: Record<NotificationTemplate, string> = {
  booking_received: "We received your appointment request",
  estimate_sent: "Your estimate is ready",
  estimate_received: "We received your estimate request",
  repair_status: "Your repair status changed",
  invoice_ready: "Your invoice is ready",
  password_reset: "Reset your Berlin AutoWorks password",
  email_verification: "Confirm your Berlin AutoWorks email",
};

export function emailSubject(template: NotificationTemplate): string {
  return subjects[template];
}
