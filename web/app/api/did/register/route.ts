// POST /api/did/register
// All comments in English per user rule

import type { NextRequest } from "next/server";
import { z } from "zod";
import { base58btc } from "multiformats/bases/base58";
import { DidDocument, RegisterDidRequestBody, RegisterDidResponseBody } from "@/types/did";
import { getDid, putDid } from "@/lib/vdr/level";
import { finalizeDidDocument } from "@/lib/did/ssikorea";

const schema = z.object({ publicKeyMultibase: z.string().min(3) });

// Very simple in-memory rate limit (token bucket like): 30 req/min per IP
const WINDOW_MS = 60_000;
const LIMIT = 30;
const hits = new Map<string, { count: number; windowStart: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const prev = hits.get(ip);
  if (!prev || now - prev.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (prev.count >= LIMIT) return false;
  prev.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  if (!rateLimit(ip))
    return new Response(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });

  let body: RegisterDidRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const parse = schema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { publicKeyMultibase } = parse.data;
  try {
    if (!publicKeyMultibase.startsWith("z")) throw new Error("invalid multibase");
    const decoded = base58btc.decode(publicKeyMultibase);
    if (decoded.length < 2) throw new Error("invalid multicodec");
    const prefix0 = decoded[0];
    const prefix1 = decoded[1];
    if (prefix0 !== 0xed || prefix1 !== 0x01)
      throw new Error("not ed25519-pub multicodec");
    const fingerprint = "z" + base58btc.encode(decoded);
    const did = `did:ssikorea:${fingerprint}`;

    // Build final DID Document from draft rules
    const baseDoc: DidDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      verificationMethod: [
        {
          id: "#key-1",
          type: "Ed25519VerificationKey2020",
          controller: did,
          publicKeyMultibase,
        },
      ],
      authentication: ["#key-1"],
      assertionMethod: ["#key-1"],
    };

    const nowIso = new Date().toISOString();
    const finalDoc = finalizeDidDocument(did, baseDoc, {
      created: nowIso,
      updated: nowIso,
    });

    // Dedup if exists
    const existing = await getDid(did);
    if (existing) {
      return new Response(JSON.stringify({ did, didDocument: JSON.parse(existing) }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    await putDid(did, JSON.stringify(finalDoc));

    const response: RegisterDidResponseBody = { did, didDocument: finalDoc };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message || "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


