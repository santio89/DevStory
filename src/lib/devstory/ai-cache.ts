import { createHash } from "crypto";

const DEFAULT_TTL_MS = 60 * 60 * 1000;

const cache = new Map<string, { json: string; expiresAt: number }>();

export function aiCacheKey(parts: string[]): string {
  return createHash("sha256").update(parts.join("\n")).digest("hex");
}

export function readAiCache<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  try {
    return JSON.parse(hit.json) as T;
  } catch {
    cache.delete(key);
    return null;
  }
}

export function writeAiCache<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_MS,
): void {
  cache.set(key, {
    json: JSON.stringify(value),
    expiresAt: Date.now() + ttlMs,
  });
}
