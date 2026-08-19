import { Resend } from "resend";
import { render } from "react-email";
import { DevStoryEmail } from "@/components/emails/devstory-email";
import type { DevStory } from "@/lib/devstory/story";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function hasEmailConfigured(): boolean {
  return resend !== null;
}

export async function sendStoryEmail({
  to,
  story,
  subject,
  ps,
  username,
  storyUrl,
}: {
  to: string;
  story: DevStory;
  subject: string;
  ps: string;
  username: string;
  storyUrl: string;
}) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const email = DevStoryEmail({
    title: story.title,
    summary: story.summary,
    eras: story.eras,
    username,
    ps,
    storyUrl,
  });
  const html = await render(email);
  const text = await render(email, { plainText: true });

  const from = process.env.RESEND_FROM ?? "DevStory <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(`Resend error: ${error.name}: ${error.message}`);
  }
}