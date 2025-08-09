// GET /api/did/[did]
// All comments in English per user rule

import { NextRequest } from "next/server";
import { getDid } from "@/lib/vdr/level";

export async function GET(
  _req: NextRequest,
  { params }: { params: { did: string } }
) {
  const did = decodeURIComponent(params.did);
  const stored = await getDid(did);
  if (!stored)
    return new Response(JSON.stringify({ error: "DID not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });

  return new Response(stored, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}


