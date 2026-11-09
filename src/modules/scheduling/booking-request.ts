import { z } from "zod";

import { isCompleteUsPhone } from "@/lib/phone";

const personName = z
  .string()
  .trim()
  .min(1, "Enter a name.")
  .max(40, "Keep each name under 40 characters.");

export const bookingRequestSchema = z.object({
  serviceSlug: z.string().trim().min(1, "Choose a service."),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00`);
      return !Number.isNaN(parsed.getTime());
    }, "Choose a valid date."),
  vehicleYear: z.coerce
    .number()
    .int("Enter a four-digit year.")
    .min(1980, "Enter a year from 1980 onward.")
    .max(new Date().getFullYear() + 1, "Enter a plausible year."),
  vehicleMake: z.string().trim().min(1, "Choose the make.").max(80),
  vehicleModel: z.string().trim().min(1, "Choose the model.").max(80),
  contactFirstName: personName,
  contactMiddleName: z
    .string()
    .trim()
    .max(40, "Keep middle name under 40 characters."),
  contactLastName: personName,
  contactEmail: z.string().trim().email("Enter a valid email address.").max(120),
  contactPhone: z
    .string()
    .trim()
    .refine(isCompleteUsPhone, "Enter a phone number as xxx-xxx-xxxx."),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters."),
  fileId: z.string().trim().max(40).default(""),
  fileToken: z.string().trim().max(200).default(""),
  company: z.string().max(0),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export function bookingRequestSchemaFor(serviceSlugs: readonly string[]) {
  const offered = new Set(serviceSlugs);
  return bookingRequestSchema.extend({
    serviceSlug: z
      .string()
      .trim()
      .min(1, "Choose a service.")
      .refine((slug) => offered.has(slug), "Choose a service we offer."),
  });
}
