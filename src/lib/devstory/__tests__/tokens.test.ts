import { describe, expect, it } from "vitest";
import { TOKEN_IDS, TOKEN_MEANINGS, pickTokenForName } from "@/lib/devstory/tokens";

describe("token gallery (stable sigils used across stories)", () => {
  it("has unique ids, a meaning for every id, and deterministic picking", () => {
    expect(new Set(TOKEN_IDS).size).toBe(TOKEN_IDS.length);
    expect(Object.keys(TOKEN_MEANINGS).length).toBe(TOKEN_IDS.length);

    for (const id of TOKEN_IDS) {
      expect(TOKEN_MEANINGS[id]).toBeTruthy();
    }

    const seedName = "octonaught";
    expect(pickTokenForName(seedName)).toBe(pickTokenForName(seedName));
    expect(TOKEN_IDS).toContain(pickTokenForName(seedName));
    expect(TOKEN_IDS).toContain(pickTokenForName("another-handle"));
  });
});