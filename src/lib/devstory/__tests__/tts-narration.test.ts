import { describe, expect, it } from "vitest";
import { narrationText } from "@/lib/devstory/tts-narration";
import type { DevStory } from "@/lib/devstory/story";

const story: DevStory = {
  title: "The Kernel Keeper",
  summary: "A journey from first scripts to shipping systems.",
  eras: [
    {
      year: "2020",
      name: "The Hello World Era",
      description: "Small scripts.",
      keyLanguages: ["JS"],
      token: "spark",
    },
    {
      year: "2022",
      name: "The Maintainer Era",
      description: "Shipping tools.",
      keyLanguages: ["TS"],
      token: "anchor",
    },
    {
      year: "2024",
      name: "The Lighthouse Era",
      description: "Teaching builders.",
      keyLanguages: ["Rust"],
      token: "beacon",
    },
  ],
  closing: "The story never ends.",
  archetype: null,
};

describe("narrationText (TTS script that backs the 'hear story' button)", () => {
  it("assembles a localized spoken script from the story", () => {
    const en = narrationText(story, "en");
    expect(en).toContain(story.title);
    expect(en).toContain(story.summary);
    expect(en).toContain("The Maintainer Era");
    expect(en).toContain("The journey moves through");
    expect(en).toContain(story.closing!);

    const es = narrationText(story, "es");
    expect(es).toContain(story.title);
    expect(es).toContain("El viaje atraviesa");
    expect(es).toContain(story.closing!);

    // Empty closing is dropped rather than producing blank noise.
    const noClosing = narrationText({ ...story, closing: null }, "en");
    expect(noClosing).not.toContain("The story never ends.");
  });
});