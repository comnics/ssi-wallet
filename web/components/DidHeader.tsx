"use client";
// Minimal header showing current DID or a placeholder
// All comments in English per user rule

import { useEffect, useState } from "react";

export default function DidHeader() {
  const [did, setDid] = useState<string | null>(null);

  useEffect(() => {
    try {
      const d = localStorage.getItem("wallet.did");
      setDid(d);
    } catch {
      setDid(null);
    }
    const onUpdate = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setDid(custom.detail || null);
    };
    window.addEventListener("wallet:did-updated", onUpdate as EventListener);
    return () => window.removeEventListener("wallet:did-updated", onUpdate as EventListener);
  }, []);

  return (
    <header className="w-full p-4 border-b border-black/10 dark:border-white/10">
      <div className="max-w-3xl mx-auto text-sm">
        {did ? (
          <span className="text-green-700 dark:text-green-400">{did}</span>
        ) : (
          <span className="text-gray-500">DID 미생성</span>
        )}
      </div>
    </header>
  );
}


