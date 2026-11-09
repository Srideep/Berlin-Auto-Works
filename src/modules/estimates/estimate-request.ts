import { z } from "zod";

import { isCompleteUsPhone } from "@/lib/phone";

const personName = z
  .string()
  .trim()
  .min(1, "Enter a name.")
  .max(40, "Keep each name under 40 characters.");

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
  fileId: z.string().trim().max(40).default(""),
  fileToken: z.string().trim().max(200).default(""),
  company: z.string().max(0),
});

export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
