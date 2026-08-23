import { describe, expect, it } from "vitest";
import { generateMockStory } from "@/lib/devstory/mock";
import { storySchema } from "@/lib/devstory/story";
import { buildFixtureData } from "../test-fixtures";

describe("generateMockStory (mock generator as a stand-in for the AI pipeline)", () => {
  it("produces a schema-valid story from raw GitHub data", () => {
    const story = generateMockStory(buildFixtureData());

    const result = storySchema.safeParse(story);
    expect(result.success).toBe(true);

    // A story must always have a full timeline, even from sparse data.
    expect(story.eras.length).toBeGreaterThanOrEqual(3);

    // Eras should be internally consistent (no empty titles).
    for (const era of story.eras) {
      expect(era.name.trim().length).toBeGreaterThan(0);
      expect(era.token).toBeTruthy();
    }
  });
});