import { describe, expect, it } from "vitest";
import { pickMomentAnchor } from "@/lib/devstory/moment";
import { buildFixtureData } from "../test-fixtures";
import { summarizeStoryData } from "@/lib/devstory/minify";
import type { Era } from "@/lib/devstory/story";

const era: Era = {
  year: "2021",
  name: "The Migration Era",
  description: "Rewriting services, learning what breaks.",
  keyLanguages: ["Python"],
  token: "bridge",
};

describe("pickMomentAnchor (random-memory widget in the story view)", () => {
  it("returns a dated memory when data exists and falls back to an era otherwise", () => {
    const snapshot = summarizeStoryData(buildFixtureData());

    const anchor = pickMomentAnchor(snapshot, era, "en", {
      seed: "stable-seed",
    });

    if (anchor.kind === "memory") {
      expect(anchor.year).toHaveLength(4);
      expect(anchor.dateLabel.length).toBeGreaterThan(0);
      expect(anchor.event.length).toBeGreaterThan(0);
    } else {
      expect(anchor.era).toBe(era);
    }

    // No repos/milestones => always the era fallback, no crash.
    const empty = pickMomentAnchor(
      { ...summarizeStoryData(buildFixtureData()), repos: [], milestones: [], latestMilestones: [] },
      era,
      "es",
      { seed: "stable-seed" },
    );
    expect(empty.kind).toBe("era");

    // Same seed => same choice every time.
    const again = pickMomentAnchor(snapshot, era, "en", {
      seed: "stable-seed",
    });
    if (anchor.kind === "memory" && again.kind === "memory") {
      expect(again.dateLabel).toBe(anchor.dateLabel);
      expect(again.event).toBe(anchor.event);
    }
  });
});