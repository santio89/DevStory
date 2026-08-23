import { describe, expect, it, vi } from "vitest";
import {
  aiCacheKey,
  readAiCache,
  writeAiCache,
} from "@/lib/devstory/ai-cache";

describe("ai cache (in-memory short-TTL store for AI JSON outputs)", () => {
  it("round-trips values, honors the TTL, and keys are deterministic", () => {
    const key = aiCacheKey(["generate", "octonaught", "en"]);

    // Deterministic key: same inputs, same key.
    expect(aiCacheKey(["generate", "octonaught", "en"])).toBe(key);
    // Different inputs, different key.
    expect(aiCacheKey(["generate", "octonaught", "es"])).not.toBe(key);

    vi.useFakeTimers();

    writeAiCache(key, { title: "The Kernel Keeper" }, 1000);
    expect(readAiCache<{ title: string }>(key)?.title).toBe("The Kernel Keeper");

    // Unknown keys miss (this is the "no garbage" guarantee).
    expect(readAiCache<{ title: string }>("definitely-missing")).toBeNull();

    vi.advanceTimersByTime(1000);
    expect(readAiCache(key)).toBeNull();

    vi.useRealTimers();
  });
});