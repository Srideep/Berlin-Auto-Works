import type { Metadata } from "next";
import { connection } from "next/server";

import { PreviewForm } from "@/components/forms/preview-form";

import { submitEstimateRequest } from "./actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Request an estimate",
  description: "Describe a repair concern and Berlin AutoWorks will follow up with an estimate.",
};

export default async function EstimatePage() {
  await connection();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Request an estimate</h1>
      <p className="mt-3 text-lg leading-8 text-muted">
        Describe the concern and the vehicle. The request is saved for an advisor.
      </p>
      <div className="mt-8">
        <PreviewForm
          formId="estimate"
          action={submitEstimateRequest}
          submitLabel="Send request"
          sections={[
            {
              title: "The concern",
              description: "What is the car doing, and when did it start?",
              fields: [
                {
                  name: "concern",
                  label: "What do you need looked at?",
                  type: "textarea",
                  required: true,
                },
              ],
            },
            {
              title: "Vehicle",
              description:
                "Choose year, make, and model from the public vehicle catalog.",
              fields: [
                {
                  name: "vehicleYmm",
                  label: "Vehicle",
                  type: "vehicleYmm",
                  required: true,
                },
              ],
            },
            {
              title: "How to reach you",
              description: "We reply by email or phone. Nothing is stored in this preview.",
              fields: [
                {
                  name: "contactFirstName",
                  label: "First name",
                  type: "text",
                  required: true,
                  autoComplete: "given-name",
                },
                {
                  name: "contactMiddleName",
                  label: "Middle name",
                  type: "text",
                  autoComplete: "additional-name",
                },
                {
                  name: "contactLastName",
                  label: "Last name",
                  type: "text",
                  required: true,
                  autoComplete: "family-name",
                },
                {
                  name: "contactEmail",
                  label: "Email",
                  type: "email",
                  required: true,
                  autoComplete: "email",
                },
                {
                  name: "contactPhone",
                  label: "Phone",
                  type: "phone",
                  required: true,
                  autoComplete: "tel",
                },
                {
                  name: "fileId",
                  label: "Photo",
                  type: "photo",
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
