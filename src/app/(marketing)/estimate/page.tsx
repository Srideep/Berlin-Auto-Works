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
        Describe the concern and the vehicle. This preview validates the request
        and does not create an estimate.
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
              description: "Year, make, and model help the advisor prepare.",
              fields: [
                {
                  name: "vehicleYear",
                  label: "Year",
                  type: "number",
                  required: true,
                },
                {
                  name: "vehicleMake",
                  label: "Make",
                  type: "text",
                  required: true,
                },
                {
                  name: "vehicleModel",
                  label: "Model",
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              title: "How to reach you",
              description: "We reply by email or phone. Nothing is stored in this preview.",
              fields: [
                {
                  name: "contactName",
                  label: "Name",
                  type: "text",
                  required: true,
                  autoComplete: "name",
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
                  type: "tel",
                  required: true,
                  autoComplete: "tel",
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
