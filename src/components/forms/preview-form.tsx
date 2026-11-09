"use client";

import { useActionState } from "react";

import { PhoneInput } from "@/components/forms/phone-input";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { VehicleYmmFields } from "@/components/forms/vehicle-ymm-fields";
import {
  initialActionState,
  type ActionState,
} from "@/lib/action-state";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "phone"
    | "vehicleYmm"
    | "date"
    | "password"
    | "textarea"
    | "select"
    | "number"
    | "photo";
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  options?: readonly { value: string; label: string }[];
}

export interface FormSection {
  title: string;
  description: string;
  fields: readonly FormField[];
}

interface PreviewFormProps {
  formId: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  sections: readonly FormSection[];
  submitLabel: string;
}

export function PreviewForm({
  formId,
  action,
  sections,
  submitLabel,
}: PreviewFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status !== "idle" ? (
        <p
          role="alert"
          className={`rounded-xl px-4 py-3 text-sm leading-6 ${
            state.status === "invalid" || state.status === "limited"
              ? "bg-red-50 text-danger"
              : state.status === "success"
                ? "bg-card text-pine ring-1 ring-line"
                : "bg-card text-ink ring-1 ring-line"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {sections.map((section, index) => (
        <fieldset key={section.title} className="space-y-4">
          <legend className="text-lg font-medium text-ink">
            <span className="mr-2 text-sm font-semibold uppercase tracking-[0.14em] text-copper">
              Step {index + 1}
            </span>
            {section.title}
          </legend>
          <p className="text-sm leading-6 text-muted">{section.description}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => {
              const error = fieldErrors[field.name];
              const inputId = `${formId}-${field.name}`;
              const errorId = `${inputId}-error`;
              const describedBy = error ? errorId : undefined;
              const className =
                "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-ink";

              return (
                <div
                  key={field.name}
                  className={
                    field.type === "textarea" ||
                    field.type === "vehicleYmm" ||
                    field.type === "photo"
                      ? "sm:col-span-2"
                      : undefined
                  }
                >
                  {field.type !== "vehicleYmm" ? (
                    <label
                      htmlFor={inputId}
                      className="mb-1 block text-sm font-semibold text-ink"
                    >
                      {field.label}
                      {field.required ? (
                        <span className="text-danger" aria-hidden="true">
                          {" "}
                          *
                        </span>
                      ) : null}
                    </label>
                  ) : null}
                  {field.type === "vehicleYmm" ? (
                    <VehicleYmmFields
                      yearId={`${inputId}-year`}
                      makeId={`${inputId}-make`}
                      modelId={`${inputId}-model`}
                      fieldErrors={{
                        vehicleYear: fieldErrors.vehicleYear,
                        vehicleMake: fieldErrors.vehicleMake,
                        vehicleModel: fieldErrors.vehicleModel,
                      }}
                      className={className}
                    />
                  ) : null}
                  {field.type === "photo" ? <PhotoUpload id={inputId} /> : null}
                  {field.type === "phone" ? (
                    <PhoneInput
                      id={inputId}
                      name={field.name}
                      required={field.required}
                      invalid={error ? true : undefined}
                      describedBy={describedBy}
                      autoComplete={field.autoComplete}
                      className={className}
                    />
                  ) : null}
                  {field.type === "textarea" ? (
                    <textarea
                      id={inputId}
                      name={field.name}
                      required={field.required}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={describedBy}
                      rows={5}
                      className={className}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <select
                      id={inputId}
                      name={field.name}
                      required={field.required}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={describedBy}
                      defaultValue=""
                      className={className}
                    >
                      <option value="" disabled>
                        Choose one
                      </option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  {field.type !== "textarea" &&
                  field.type !== "select" &&
                  field.type !== "phone" &&
                  field.type !== "photo" &&
                  field.type !== "vehicleYmm" ? (
                    <input
                      id={inputId}
                      name={field.name}
                      type={field.type}
                      required={field.required}
                      defaultValue={field.defaultValue}
                      autoComplete={field.autoComplete}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={describedBy}
                      className={className}
                    />
                  ) : null}
                  {error ? (
                    <p id={errorId} className="mt-1 text-sm text-danger">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-5 text-base font-semibold text-white hover:bg-copper-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
