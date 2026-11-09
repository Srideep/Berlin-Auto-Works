"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildVehicleYearOptions,
  fetchCarMakes,
  fetchModelsForMakeYear,
} from "@/lib/vehicle-catalog-client";

interface VehicleYmmFieldsProps {
  yearId: string;
  makeId: string;
  modelId: string;
  fieldErrors?: Partial<Record<"vehicleYear" | "vehicleMake" | "vehicleModel", string>>;
  className: string;
}

export function VehicleYmmFields({
  yearId,
  makeId,
  modelId,
  fieldErrors,
  className,
}: VehicleYmmFieldsProps) {
  const yearOptions = useMemo(() => buildVehicleYearOptions(), []);
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [makes, setMakes] = useState<readonly { value: string; label: string }[]>(
    [],
  );
  const [models, setModels] = useState<readonly { value: string; label: string }[]>(
    [],
  );
  const [makeStatus, setMakeStatus] = useState<"idle" | "loading" | "error">("idle");
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const options = await fetchCarMakes();
        if (!cancelled) {
          setMakes(options);
          setMakeStatus("idle");
        }
      } catch {
        if (!cancelled) {
          setMakeStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!year || !make) {
      return;
    }

    let cancelled = false;
    const parsedYear = Number(year);
    void (async () => {
      setModelStatus("loading");
      try {
        const options = await fetchModelsForMakeYear(make, parsedYear);
        if (!cancelled) {
          setModels(options);
          setModelStatus("idle");
        }
      } catch {
        if (!cancelled) {
          setModels([]);
          setModelStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, make]);

  const selectProps = (error?: string) => ({
    className,
    "aria-invalid": error ? true : (undefined as boolean | undefined),
  });

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
      <div>
        <label htmlFor={yearId} className="mb-1 block text-sm font-semibold text-ink">
          Year
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <select
          id={yearId}
          name="vehicleYear"
          required
          value={year}
          onChange={(event) => {
            setYear(event.target.value);
            setModels([]);
            setModel("");
          }}
          {...selectProps(fieldErrors?.vehicleYear)}
        >
          <option value="" disabled>
            Choose year
          </option>
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors?.vehicleYear ? (
          <p className="mt-1 text-sm text-danger">{fieldErrors.vehicleYear}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={makeId} className="mb-1 block text-sm font-semibold text-ink">
          Make
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <select
          id={makeId}
          name="vehicleMake"
          required
          value={make}
          disabled={makeStatus === "loading" || makeStatus === "error"}
          onChange={(event) => {
            setMake(event.target.value);
            setModels([]);
            setModel("");
          }}
          {...selectProps(fieldErrors?.vehicleMake)}
        >
          <option value="" disabled>
            {makeStatus === "loading"
              ? "Loading makes…"
              : makeStatus === "error"
                ? "Makes unavailable"
                : "Choose make"}
          </option>
          {makes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {makeStatus === "error" ? (
          <p className="mt-1 text-sm text-danger">
            Could not load makes. Check your connection and refresh.
          </p>
        ) : null}
        {fieldErrors?.vehicleMake ? (
          <p className="mt-1 text-sm text-danger">{fieldErrors.vehicleMake}</p>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={modelId} className="mb-1 block text-sm font-semibold text-ink">
          Model
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <select
          id={modelId}
          name="vehicleModel"
          required
          value={model}
          disabled={!year || !make || modelStatus === "loading"}
          onChange={(event) => {
            setModel(event.target.value);
          }}
          {...selectProps(fieldErrors?.vehicleModel)}
        >
          <option value="" disabled>
            {!year || !make
              ? "Choose year and make first"
              : modelStatus === "loading"
                ? "Loading models…"
                : modelStatus === "error"
                  ? "Models unavailable"
                  : models.length === 0
                    ? "No models listed for this year"
                    : "Choose model"}
          </option>
          {models.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors?.vehicleModel ? (
          <p className="mt-1 text-sm text-danger">{fieldErrors.vehicleModel}</p>
        ) : null}
        <p className="mt-2 text-xs leading-5 text-muted">
          Year, make, and model come from the public NHTSA vehicle catalog, not your
          shop database.
        </p>
      </div>
    </div>
  );
}
