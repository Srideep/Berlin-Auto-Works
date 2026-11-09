import { z } from "zod";

import { enforceRateLimit } from "@/modules/identity/rate-limit";
import { createSignedUpload } from "@/modules/files/storage";

const bodySchema = z.object({
  contentType: z.string().trim().max(100),
  byteSize: z.number().int(),
});

export async function POST(request: Request): Promise<Response> {
  const decision = await enforceRateLimit("upload");
  if (!decision.allowed) {
    return Response.json(
      { error: "Too many uploads. Try again later." },
      { status: 429 },
    );
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Send a photo description." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Send a photo description." }, { status: 400 });
  }
  const signed = await createSignedUpload(parsed.data);
  if (!signed.ok) {
    return Response.json({ error: signed.message }, { status: 422 });
  }
  return Response.json({
    fileId: signed.fileId,
    token: signed.token,
    uploadUrl: signed.uploadUrl,
  });
}
