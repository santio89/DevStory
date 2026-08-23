import { NextResponse } from "next/server";
import { z } from "zod";
import { generateEmailCopy } from "@/lib/devstory/generate";
import { storySchema } from "@/lib/devstory/story";
import { sendStoryEmail, EmailSendError, hasEmailConfigured } from "@/lib/email";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";
import { resolveGitHubAvatar } from "@/lib/github/avatar";
import { shareStoryUrl, shareUsernameUrl } from "@/lib/site";

export const maxDuration = 60;

const bodySchema = z.object({
  username: z.string().min(1).max(39),
  email: z.string().email().max(254),
  story: storySchema,
  displayName: z.string().min(1).max(120).optional(),
  storyId: z.string().uuid().optional(),
  avatarUrl: z.string().url().max(512).optional().nullable(),
  locale: z.string().optional(),
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
  const locale = isLocale(parsed.locale) ? parsed.locale : "en";
  const t = dictionary[locale].share;
  const avatarUrl =
    parsed.avatarUrl?.trim() ||
    resolveGitHubAvatar({ username, avatarUrl: parsed.avatarUrl ?? null });

  const storyUrl = parsed.storyId
    ? shareStoryUrl(parsed.storyId, locale)
    : shareUsernameUrl(username, locale);

  try {
    const copy = await generateEmailCopy(parsed.story, locale);
    await sendStoryEmail({
      to: normalizedEmail,
      story: parsed.story,
      subject: copy.subject,
      ps: copy.ps,
      username: displayName,
      handle: username,
      avatarUrl,
      storyUrl,
      locale,
      labels: {
        brand: t.emailBrand,
        subtitle: t.emailSubtitleFor(displayName),
        blurb: t.emailBlurbFor(displayName),
        cta: t.emailCtaFor(displayName),
        psLabel: t.emailPsLabel,
        footer: t.emailFooter,
      },
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
