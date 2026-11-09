import { Resend } from "resend";

import { emailSubject, type OutboundEmail } from "@/modules/notifications/message";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function deliverEmail(message: OutboundEmail): Promise<boolean> {
  if (!emailConfigured()) {
    return false;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "",
    to: message.to,
    subject: message.subject || emailSubject(message.template),
    text: message.text,
  });
  return result.error === null;
}
