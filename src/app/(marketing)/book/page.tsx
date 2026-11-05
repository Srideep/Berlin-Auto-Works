import type { Metadata } from "next";
import { connection } from "next/server";

import { PreviewForm } from "@/components/forms/preview-form";
import { serviceOfferings } from "@/modules/catalog/services";

import { submitBookingRequest } from "./actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Book service",
  description: "Request a service appointment at Berlin AutoWorks. Availability is checked when booking opens.",
};

export default async function BookPage() {
  await connection();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-ink">Book service</h1>
      <p className="mt-3 text-lg leading-8 text-muted">
        Tell us the job, the vehicle, and how to reach you. Open appointment times
        are not cached. This preview checks the form and does not create an appointment.
      </p>
      <div className="mt-8">
        <PreviewForm
          formId="book"
          action={submitBookingRequest}
          submitLabel="Request appointment"
          sections={[
            {
              title: "Service",
              description: "Pick the work that is closest. The advisor can adjust it.",
              fields: [
                {
                  name: "serviceSlug",
                  label: "Service",
                  type: "select",
                  required: true,
                  options: serviceOfferings.map((service) => ({
                    value: service.slug,
                    label: service.name,
                  })),
                },
                {
                  name: "preferredDate",
                  label: "Preferred date",
                  type: "date",
                  required: true,
                  autoComplete: "off",
                },
              ],
            },
            {
              title: "Vehicle",
              description: "Year, make, and model are enough to start.",
              fields: [
                {
                  name: "vehicleYear",
                  label: "Year",
                  type: "number",
                  required: true,
                  autoComplete: "off",
                },
                {
                  name: "vehicleMake",
                  label: "Make",
                  type: "text",
                  required: true,
                  autoComplete: "off",
                },
                {
                  name: "vehicleModel",
                  label: "Model",
                  type: "text",
                  required: true,
                  autoComplete: "off",
                },
              ],
            },
            {
              title: "How to reach you",
              description: "We use this to confirm a time. It is not stored in this preview.",
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
                {
                  name: "notes",
                  label: "Notes",
                  type: "textarea",
                  autoComplete: "off",
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
