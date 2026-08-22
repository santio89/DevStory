import { createHash } from "crypto";

const TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map<string, { audio: Buffer; expiresAt: number }>();

export function ttsCacheKey(text: string, locale: string): string {
  return createHash("sha256").update(`${locale}\n${text}`).digest("hex");
}

export function readTtsCache(key: string): Buffer | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.audio;
}

export function writeTtsCache(key: string, audio: Buffer): void {
  cache.set(key, { audio, expiresAt: Date.now() + TTL_MS });
}
