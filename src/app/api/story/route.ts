import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDevStoryData, toPreviewData } from "@/lib/devstory/aggregate";
import { isValidGitHubUsername, normalizeGitHubUsername } from "@/lib/github/username";
import { STORY_COMMIT_PROBE } from "@/lib/github/probe-repos";

const querySchema = z.object({
  username: z.string().min(1).max(39),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    username: url.searchParams.get("username") ?? "",
  });

  if (!parsed.success || !isValidGitHubUsername(parsed.data.username)) {
    return NextResponse.json({ error: "Invalid GitHub username." }, { status: 400 });
  }

  const username = normalizeGitHubUsername(parsed.data.username);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  try {
    const data = await buildDevStoryData(username, {
      forceRefresh,
      commitProbeLimit: STORY_COMMIT_PROBE,
    });
    return NextResponse.json({ preview: toPreviewData(data) });
  } catch (error) {
    console.error("Failed to build DevStory data:", error);
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
            : "Failed to fetch GitHub data.",
      },
      { status },
    );
  }
}
