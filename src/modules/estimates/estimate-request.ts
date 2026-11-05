import { z } from "zod";

export const estimateRequestSchema = z.object({
  concern: z
    .string()
    .trim()
    .min(10, "Describe the concern in at least a sentence.")
    .max(2000, "Keep the description under 2000 characters."),
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
  company: z.string().max(0),
});

export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
