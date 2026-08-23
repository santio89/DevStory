import { describe, expect, it } from "vitest";
import { dictionary, locales, isLocale } from "@/lib/i18n/dictionary";

function leafKeys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    leafKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("i18n locale parity (both languages must stay complete)", () => {
  it("en and es expose identical message trees", () => {
    expect(locales).toEqual(["en", "es"]);

    const enKeys = leafKeys(dictionary.en).sort();
    const esKeys = leafKeys(dictionary.es).sort();

    expect(esKeys).toEqual(enKeys);

    // No accidentally-empty strings anywhere.
    for (const node of [dictionary.en, dictionary.es]) {
      const keys = leafKeys(node);
      for (const key of keys) {
        const value = key.split(".").reduce<unknown>(
          (acc, part) =>
            (acc as Record<string, unknown>)[part],
          node,
        );
        if (typeof value === "string") {
          expect(value.length).toBeGreaterThan(0);
        }
      }
    }

    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});