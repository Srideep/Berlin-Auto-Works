export function buildVehicleYearOptions(): readonly {
  value: string;
  label: string;
}[] {
  const latest = new Date().getFullYear() + 1;
  const years: { value: string; label: string }[] = [];
  for (let year = latest; year >= 1980; year -= 1) {
    years.push({ value: String(year), label: String(year) });
  }
  return years;
}

export async function fetchCarMakes(): Promise<
  readonly { value: string; label: string }[]
> {
  const response = await fetch("/api/vehicle-catalog/makes");
  if (!response.ok) {
    throw new Error("makes unavailable");
  }
  const body = (await response.json()) as { makes: { value: string; label: string }[] };
  return body.makes;
}

export async function fetchModelsForMakeYear(
  make: string,
  year: number,
): Promise<readonly { value: string; label: string }[]> {
  const params = new URLSearchParams({ make, year: String(year) });
  const response = await fetch(`/api/vehicle-catalog/models?${params.toString()}`);
  if (!response.ok) {
    throw new Error("models unavailable");
  }
  const body = (await response.json()) as {
    models: { value: string; label: string }[];
  };
  return body.models;
}
