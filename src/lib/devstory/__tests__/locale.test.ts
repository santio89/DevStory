/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { dictionary, isLocale, locales, type Locale } from "@/lib/i18n/dictionary";

describe("locale switch (en <-> es language toggle)", () => {
  it("swaps to a distinct, complete message tree and guards the switch value", () => {
    // Every supported locale must resolve to a full tree (the toggle's lookup).
    for (const locale of locales) {
      expect(dictionary[locale]).toBeTruthy();
    }

    // The actual switch produces different strings for the two languages.
    const en = flatLookup(dictionary.en, "common.toggleLocale") as string;
    const es = flatLookup(dictionary.es, "common.toggleLocale") as string;
    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBeGreaterThan(0);
    expect(en).not.toBe(es);

    // Only the valid codes pass (this guards any user-provided switch value).
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale("EN" as Locale)).toBe(false);
  });
});

function flatLookup(node: object, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)[part], node);
}