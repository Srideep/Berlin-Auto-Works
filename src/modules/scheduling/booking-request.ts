import { z } from "zod";

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
  vehicleMake: z.string().trim().min(1, "Enter the make.").max(40),
  vehicleModel: z.string().trim().min(1, "Enter the model.").max(40),
  contactName: z.string().trim().min(1, "Enter your name.").max(80),
  contactEmail: z.string().trim().email("Enter a valid email address.").max(120),
  contactPhone: z.string().trim().min(7, "Enter a phone number.").max(30),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters."),
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
