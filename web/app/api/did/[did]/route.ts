// GET /api/did/[did]
// All comments in English per user rule

import { getDid } from "@/lib/vdr/level";

export const runtime = "nodejs";

type RouteParams = { params: { did: string } };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: Request, ctx: any) {
  const { params } = ctx;
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


