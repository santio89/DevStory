import { describe, expect, it } from "vitest";
import {
  MIN_ERAS,
  MAX_ERAS,
  computeTargetEraCount,
  eraCountGuidance,
} from "@/lib/devstory/story-richness";
import { buildFixtureData } from "../test-fixtures";

describe("story richness sizing (decides how many eras the timeline gets)", () => {
  it("stays within bounds and grows with the span of the history", () => {
    const sparse = buildFixtureData({ languagesByYear: [] });
    const rich = buildFixtureData({
      languagesByYear: [
        { year: "2015", languages: [{ language: "JS", repoCount: 1 }] },
        { year: "2016", languages: [{ language: "JS", repoCount: 1 }] },
        { year: "2017", languages: [{ language: "JS", repoCount: 1 }] },
        { year: "2018", languages: [{ language: "JS", repoCount: 1 }] },
        { year: "2019", languages: [{ language: "JS", repoCount: 1 }] },
        { year: "2020", languages: [{ language: "TS", repoCount: 1 }] },
        { year: "2021", languages: [{ language: "TS", repoCount: 1 }] },
        { year: "2022", languages: [{ language: "TS", repoCount: 1 }] },
        { year: "2023", languages: [{ language: "TS", repoCount: 1 }] },
        { year: "2024", languages: [{ language: "TS", repoCount: 1 }] },
      ],
      totals: {
        ...buildFixtureData().totals,
        repoCount: 40,
        commitsAnalyzed: 1200,
      },
    });

    const sparseTarget = computeTargetEraCount(sparse);
    const richTarget = computeTargetEraCount(rich);

    expect(sparseTarget).toBeGreaterThanOrEqual(MIN_ERAS);
    expect(sparseTarget).toBeLessThanOrEqual(MAX_ERAS);
    expect(richTarget).toBeLessThanOrEqual(MAX_ERAS);
    expect(richTarget).toBeGreaterThan(sparseTarget);

    expect(eraCountGuidance(sparse)).toContain(String(MIN_ERAS));
    expect(eraCountGuidance(rich)).toContain(String(MAX_ERAS));
  });
});