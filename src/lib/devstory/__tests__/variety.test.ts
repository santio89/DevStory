import { describe, expect, it } from "vitest";
import {
  needsVarietyRetry,
  storyVarietyIssues,
} from "@/lib/devstory/variety";
import type { DevStory } from "@/lib/devstory/story";
import { generateMockStory } from "@/lib/devstory/mock";
import { buildFixtureData } from "../test-fixtures";

function storyWithRepeatedEras(): DevStory {
  return {
    title: "Journey of a Builder",
    summary: "Learned to code and kept going.",
    eras: [
      {
        year: "2020",
        name: "Start",
        description: "I learned to code. I kept building and the nights got long.",
        keyLanguages: ["JS"],
        token: "spark",
      },
      {
        year: "2021",
        name: "Growth",
        description: "I learned to code. I kept building and the nights got long.",
        keyLanguages: ["TS"],
        token: "flame",
      },
      {
        year: "2022",
        name: "Peak",
        description: "A different era entirely, fresh ground underfoot.",
        keyLanguages: ["Python"],
        token: "peak",
      },
    ],
    closing: "And so the journey continued.",
    archetype: null,
  };
}

describe("variety quality gate (guards the AI against repetitive drafts)", () => {
  it("flags repeated era wording and passes clean mock output", () => {
    const duplicate = storyWithRepeatedEras();

    expect(storyVarietyIssues(duplicate).length).toBeGreaterThan(0);
    expect(needsVarietyRetry(duplicate)).toBe(true);

    // Mock generator itself loops until the draft passes the quality gate.
    const clean = generateMockStory(buildFixtureData());
    expect(needsVarietyRetry(clean)).toBe(false);
    expect(storyVarietyIssues(clean)).toEqual([]);
  });
});