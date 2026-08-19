import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  buildDevStoryData,
  toPreviewData,
} from "@/lib/devstory/aggregate";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  try {
    const data = await buildDevStoryData(session.accessToken, { forceRefresh });
    return NextResponse.json({ preview: toPreviewData(data) });
  } catch (error) {
    console.error("Failed to build DevStory data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data. Check your token permissions." },
      { status: 502 },
    );
  }
}
