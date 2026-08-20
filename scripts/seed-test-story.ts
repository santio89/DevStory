import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { stories } from "../src/lib/db/schema";
import type { DevStory } from "../src/lib/devstory/story";

loadEnvConfig(process.cwd());

const TEST_ID = "11111111-2222-4333-8444-555555555555";

const story: DevStory = {
  title: "From Hello World to Systems",
  summary:
    "A developer who started from zero and kept building through the years, one repo at a time.",
  closing: "The journey continues with every new commit.",
  archetype: "The Midnight Architect",
  eras: [
    {
      year: "2019",
      name: "The Hello World Era",
      description: "Learning to code one commit at a time.",
      keyLanguages: ["JavaScript"],
      token: "sprout",
    },
    {
      year: "2021",
      name: "The Framework Awakening",
      description: "Discovering frameworks and structure.",
      keyLanguages: ["TypeScript"],
      token: "frame",
    },
    {
      year: "2023",
      name: "The Mastery Era",
      description: "Building systems and teaching others.",
      keyLanguages: ["Python"],
      token: "peak",
    },
  ],
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }
  const db = drizzle(neon(url));
  await db
    .insert(stories)
    .values({
      id: TEST_ID,
      githubLogin: "testuser",
      username: "Test User",
      title: story.title,
      summary: story.summary,
      story,
      mode: "ai",
    })
    .onConflictDoUpdate({
      target: stories.id,
      set: { story, title: story.title, summary: story.summary, mode: "ai" },
    });
  console.log("inserted", TEST_ID);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});