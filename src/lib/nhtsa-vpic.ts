import "server-only";

const vpicBase = "https://vpic.nhtsa.dot.gov/api/vehicles";

interface VpicMakeRow {
  MakeName: string;
}

interface VpicModelRow {
  Model_Name: string;
}

interface VpicResponse<T> {
  Results: T[];
}

function titleCaseLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function readVpicJson<T>(url: string): Promise<T[]> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86_400 },
  });
  if (!response.ok) {
    throw new Error(`Vehicle catalog request failed (${response.status}).`);
  }
  const body = (await response.json()) as VpicResponse<T>;
  return body.Results ?? [];
}

export async function listCarMakes(): Promise<
  readonly { value: string; label: string }[]
> {
  const results = await readVpicJson<VpicMakeRow>(
    `${vpicBase}/GetMakesForVehicleType/car?format=json`,
  );
  const names = new Set<string>();
  for (const row of results) {
    if (row.MakeName) {
      names.add(row.MakeName);
    }
  }
  return [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((make) => ({ value: make, label: titleCaseLabel(make) }));
}

export async function listModelsForMakeYear(
  make: string,
  year: number,
): Promise<readonly { value: string; label: string }[]> {
  const encodedMake = encodeURIComponent(make);
  const results = await readVpicJson<VpicModelRow>(
    `${vpicBase}/GetModelsForMakeYear/make/${encodedMake}/modelyear/${year}?format=json`,
  );
  const names = new Set<string>();
  for (const row of results) {
    if (row.Model_Name) {
      names.add(row.Model_Name);
    }
  }
  return [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((model) => ({ value: model, label: titleCaseLabel(model) }));
}

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
