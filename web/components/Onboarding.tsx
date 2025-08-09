"use client";
// Onboarding form to create DID
// All comments in English per user rule

import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import * as ed25519 from "@noble/ed25519";
import { generateEd25519KeyPair } from "@/lib/crypto/keys";
import { encryptAndStorePrivateKey } from "@/lib/crypto/keystore";
import { DidDocument, RegisterDidResponseBody } from "@/types/did";

const formSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "YYYY-MM-DD 형식"),
});

function derivePassphrase(name: string, dob: string): string {
  return `${name}|${dob}`;
}

export default function Onboarding() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [did, setDid] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    const parsed = formSchema.safeParse({ name, dob });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "입력이 올바르지 않습니다");
      return;
    }
    setLoading(true);
    try {
      const { publicKey, privateKey, publicKeyMultibase } = await generateEd25519KeyPair();

      // Draft doc sent implicitly as method decision; server finalizes
      const resp = await fetch("/api/did/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publicKeyMultibase }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || `Registration failed (${resp.status})`);
      }
      const data = (await resp.json()) as RegisterDidResponseBody;
      const passphrase = derivePassphrase(name, dob);
      await encryptAndStorePrivateKey("wallet.key.v1", privateKey, passphrase);
      localStorage.setItem("wallet.did", data.did);
      setDid(data.did);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [name, dob]);

  const disabled = useMemo(() => loading || !name || !dob, [loading, name, dob]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">온보딩</h1>
      <div className="grid gap-2">
        <label className="text-sm">이름</label>
        <input
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm">생년월일 (YYYY-MM-DD)</label>
        <input
          className="border rounded px-3 py-2"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          placeholder="1990-01-01"
        />
      </div>
      <button
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSubmit}
        disabled={disabled}
      >
        {loading ? "생성 중..." : "DID 생성"}
      </button>
      {did && (
        <div className="text-sm text-green-700">생성된 DID: {did}</div>
      )}
      {error && <div className="text-sm text-red-600">오류: {error}</div>}
    </div>
  );
}


