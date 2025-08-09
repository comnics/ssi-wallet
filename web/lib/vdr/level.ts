// LevelDB VDR singleton instance and helpers
// All comments in English per user rule

import { Level } from "level";
import path from "node:path";
import fs from "node:fs";

let db: Level<string, string> | null = null;

export function getVdr(): Level<string, string> {
  if (db) return db;
  // Place LevelDB under repository root ./data/vdr
  const dataDir = path.resolve(process.cwd(), "..", "data", "vdr");
  fs.mkdirSync(dataDir, { recursive: true });
  db = new Level<string, string>(dataDir, { valueEncoding: "utf8" });
  return db;
}

export async function putDid(did: string, docJson: string): Promise<void> {
  const key = did.startsWith("did:") ? did : `did:${did}`;
  const vdr = getVdr();
  await vdr.put(key, docJson);
}

export async function getDid(did: string): Promise<string | null> {
  const key = did.startsWith("did:") ? did : `did:${did}`;
  const vdr = getVdr();
  try {
    const value = await vdr.get(key);
    return value;
  } catch (err) {
    const e = err as { code?: string };
    if (e && e.code === "LEVEL_NOT_FOUND") return null;
    throw err as Error;
  }
}


