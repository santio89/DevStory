import { render } from "react-email";
import { DevStoryEmail } from "@/components/emails/devstory-email";
import type { DevStory } from "@/lib/devstory/story";
import {
  EmailSendError,
  getActiveEmailProvider,
  hasEmailProviderConfigured,
  sendTransactionalEmail,
} from "@/lib/email/provider";

export { EmailSendError, getActiveEmailProvider };

export function hasEmailConfigured(): boolean {
  return hasEmailProviderConfigured();
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

  await sendTransactionalEmail({
    to,
    subject,
    html,
    text,
  });
}
