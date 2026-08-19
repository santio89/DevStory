import { NextResponse } from "next/server";
import { z } from "zod";
import { and, count, eq, gte } from "drizzle-orm";
import { auth } from "@/auth";
import { generateEmailCopy } from "@/lib/devstory/generate";
import { getDb, hasDatabase } from "@/lib/db";
import { stories, storyEmails } from "@/lib/db/schema";
import { sendStoryEmail } from "@/lib/email";

export const maxDuration = 60;

const bodySchema = z.object({
  storyId: z.string().uuid(),
  email: z.string().email().max(254),
});

const DAILY_EMAIL_CAP = 3;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = getDb();
  const normalizedEmail = parsed.email.toLowerCase();

  const [storyRow] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, parsed.storyId));

  if (!storyRow) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 });
  }

  if (storyRow.githubLogin !== session.user.username) {
    return NextResponse.json({ error: "Not your story." }, { status: 403 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [sent] = await db
    .select({ value: count() })
    .from(storyEmails)
    .where(
      and(
        eq(storyEmails.email, normalizedEmail),
        gte(storyEmails.createdAt, startOfDay),
      ),
    );

  if ((sent?.value ?? 0) >= DAILY_EMAIL_CAP) {
    return NextResponse.json(
      { error: "Daily email limit reached for this address." },
      { status: 429 },
    );
  }

  let subject = storyRow.emailSubject;
  let ps = storyRow.emailPs ?? "";
  if (!subject) {
    const copy = await generateEmailCopy(storyRow.story);
    subject = copy.subject;
    ps = copy.ps;
    await db
      .update(stories)
      .set({ emailSubject: subject, emailPs: ps })
      .where(eq(stories.id, storyRow.id));
  }

  const storyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/story/${storyRow.id}`;

  try {
    await sendStoryEmail({
      to: normalizedEmail,
      story: storyRow.story,
      subject,
      ps,
      username: storyRow.username,
      storyUrl,
    });
    await db.insert(storyEmails).values({
      storyId: storyRow.id,
      email: normalizedEmail,
      status: "sent",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Story email send failed:", error);
    try {
      await db.insert(storyEmails).values({
        storyId: storyRow.id,
        email: normalizedEmail,
        status: "failed",
      });
    } catch (logError) {
      console.error("Failed to log email attempt:", logError);
    }
    return NextResponse.json(
      { error: "Email could not be sent. Try again." },
      { status: 502 },
    );
  }
}