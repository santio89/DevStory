import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDevStoryData } from "@/lib/devstory/aggregate";
import { generateStory } from "@/lib/devstory/generate";
import { summarizeStoryData } from "@/lib/devstory/minify";
import { STORY_COMMIT_PROBE } from "@/lib/github/probe-repos";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";

export const maxDuration = 120;

const bodySchema = z.object({
  username: z.string().min(1).max(39),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidGitHubUsername(body.username)) {
    return NextResponse.json({ error: "Invalid GitHub username." }, { status: 400 });
  }

  const username = normalizeGitHubUsername(body.username);
  const locale: Locale = isLocale(body.locale) ? body.locale : "en";

  try {
    const data = await buildDevStoryData(username, {
      commitProbeLimit: STORY_COMMIT_PROBE,
    });
    const { story, mode } = await generateStory(data, locale);

    return NextResponse.json({
      story,
      mode,
      username: data.username,
      data: summarizeStoryData(data),
    });
  } catch (error) {
    console.error("Story generation failed:", error);
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 404
        ? 404
        : 502;
    return NextResponse.json(
      {
        error:
          status === 404
            ? "GitHub user not found."
            : "Failed to generate this story.",
      },
      { status },
    );
  }
}
