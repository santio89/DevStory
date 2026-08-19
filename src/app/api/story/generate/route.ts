import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildDevStoryData } from "@/lib/devstory/aggregate";
import { generateStory } from "@/lib/devstory/generate";
import { getDb, hasDatabase } from "@/lib/db";
import { stories } from "@/lib/db/schema";

export const maxDuration = 60;

export async function POST() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await buildDevStoryData(session.accessToken);
    const { story, mode } = await generateStory(data);

    let storyId: string | null = null;
    if (hasDatabase()) {
      const db = getDb();
      const [row] = await db
        .insert(stories)
        .values({
          githubLogin: data.username,
          username: data.name,
          title: story.title,
          summary: story.summary,
          story,
          mode,
        })
        .onConflictDoUpdate({
          target: stories.githubLogin,
          set: {
            username: data.name,
            title: story.title,
            summary: story.summary,
            story,
            mode,
            updatedAt: new Date(),
          },
        })
        .returning({ id: stories.id });
      storyId = row.id;
    }

    return NextResponse.json({ story, mode, storyId });
  } catch (error) {
    console.error("Story generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate your story." },
      { status: 502 },
    );
  }
}