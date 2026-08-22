import { NextResponse } from "next/server";
import { z } from "zod";
import { generateEmailCopy } from "@/lib/devstory/generate";
import { storySchema } from "@/lib/devstory/story";
import { sendStoryEmail, EmailSendError, hasEmailConfigured } from "@/lib/email";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";
import { publicUrl } from "@/lib/site";

export const maxDuration = 60;

const bodySchema = z.object({
  username: z.string().min(1).max(39),
  email: z.string().email().max(254),
  story: storySchema,
  displayName: z.string().min(1).max(120).optional(),
  storyId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  if (!hasEmailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured." },
      { status: 503 },
    );
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidGitHubUsername(parsed.username)) {
    return NextResponse.json({ error: "Invalid GitHub username." }, { status: 400 });
  }

  const username = normalizeGitHubUsername(parsed.username);
  const normalizedEmail = parsed.email.toLowerCase();
  const displayName = parsed.displayName ?? username;

  const storyUrl = parsed.storyId
    ? publicUrl(`/story/${parsed.storyId}`)
    : publicUrl(`/?u=${encodeURIComponent(username)}`);

  try {
    const copy = await generateEmailCopy(parsed.story);
    await sendStoryEmail({
      to: normalizedEmail,
      story: parsed.story,
      subject: copy.subject,
      ps: copy.ps,
      username: displayName,
      storyUrl,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Story email send failed:", error);
    if (error instanceof EmailSendError) {
      return NextResponse.json(
        { error: error.userMessage },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Email could not be sent. Try again." },
      { status: 502 },
    );
  }
}
