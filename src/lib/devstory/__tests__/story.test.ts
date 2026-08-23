import { describe, expect, it } from "vitest";
import { storySchema, type DevStory } from "@/lib/devstory/story";

const validStory: DevStory = {
  title: "The Kernel Keeper",
  summary: "A journey from first scripts to shipping systems that hold.",
  eras: [
    {
      year: "2019",
      name: "The Hello World Era",
      description: "Small scripts and big dreams in a rented bedroom.",
      keyLanguages: ["JavaScript"],
      token: "sprout",
    },
    {
      year: "2021",
      name: "The Migration Era",
      description: "Rewriting services, learning what breaks and why.",
      keyLanguages: ["Python"],
      token: "bridge",
    },
    {
      year: "2024",
      name: "The Maintainer Era",
      description: "Shipping tools and teaching the next batch of builders.",
      keyLanguages: ["TypeScript", "Rust"],
      token: "anchor",
    },
  ],
  closing: "Every commit wrote the north star.",
  archetype: "The Systems Builder",
};

describe("storySchema (core contract of the whole pipeline)", () => {
  it("accepts a well-formed story and rejects malformed ones", () => {
    expect(storySchema.safeParse(validStory).success).toBe(true);

    // Too few eras breaks the 3-era minimum.
    const twoEras = { ...validStory, eras: validStory.eras.slice(0, 2) };
    expect(storySchema.safeParse(twoEras).success).toBe(false);

    // A token outside the gallery must be rejected at the schema level.
    const badToken = {
      ...validStory,
      eras: [
        { ...validStory.eras[0], token: "not-a-real-token" },
        ...validStory.eras.slice(1),
      ],
    };
    const result = storySchema.safeParse(badToken);
    expect(result.success).toBe(false);

    // Fields the UI depends on must be required.
    const missingTitle = { ...validStory, title: undefined };
    expect(storySchema.safeParse(missingTitle).success).toBe(false);
  });
});