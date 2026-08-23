import { render } from "react-email";
import {
  DevStoryEmail,
  type EmailTemplateLabels,
} from "@/components/emails/devstory-email";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";
import { resolveGitHubAvatar } from "@/lib/github/avatar";
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
  handle,
  avatarUrl,
  storyUrl,
  labels,
  locale = "en",
}: {
  to: string;
  story: DevStory;
  subject: string;
  ps: string;
  username: string;
  handle: string;
  avatarUrl?: string | null;
  storyUrl: string;
  labels: EmailTemplateLabels;
  locale?: Locale;
}) {
  const email = DevStoryEmail({
    title: story.title,
    summary: story.summary,
    eras: story.eras,
    username,
    handle,
    avatarUrl,
    ps,
    storyUrl,
    labels,
    locale,
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
