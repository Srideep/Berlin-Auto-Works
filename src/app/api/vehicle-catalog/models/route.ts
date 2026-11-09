import { z } from "zod";

import { listModelsForMakeYear } from "@/lib/nhtsa-vpic";

const querySchema = z.object({
  make: z.string().trim().min(1).max(80),
  year: z.coerce
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
});

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    make: searchParams.get("make") ?? "",
    year: searchParams.get("year") ?? "",
  });
  if (!parsed.success) {
    return Response.json({ error: "Invalid make or year." }, { status: 400 });
  }

  try {
    const models = await listModelsForMakeYear(
      parsed.data.make,
      parsed.data.year,
    );
    return Response.json({ models }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Could not load vehicle models." },
      { status: 502 },
    );
  }
}
