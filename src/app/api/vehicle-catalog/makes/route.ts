import { listCarMakes } from "@/lib/nhtsa-vpic";

export async function GET(): Promise<Response> {
  try {
    const makes = await listCarMakes();
    return Response.json({ makes }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Could not load vehicle makes." },
      { status: 502 },
    );
  }
}
