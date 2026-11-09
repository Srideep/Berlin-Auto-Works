import type { NextRequest } from "next/server";

import { getAuth } from "@/auth";

function unavailable(): Response {
  return new Response("Sign-in is not configured.", { status: 503 });
}

export function GET(request: NextRequest): Promise<Response> | Response {
  const auth = getAuth();
  if (!auth) {
    return unavailable();
  }
  return auth.handlers.GET(request);
}

export function POST(request: NextRequest): Promise<Response> | Response {
  const auth = getAuth();
  if (!auth) {
    return unavailable();
  }
  return auth.handlers.POST(request);
}
