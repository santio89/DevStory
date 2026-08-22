import { NextResponse } from "next/server";
import {
  chatStream,
  chatSystemPromptFromData,
  isOffTopic,
  NoAIError,
  type ChatRole,
} from "@/lib/devstory/ai";
import { buildDevStoryData } from "@/lib/devstory/aggregate";
import { validateStory } from "@/lib/devstory/translate";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { ChatExtras } from "@/lib/devstory/chat-context";
import { CHAT_COMMIT_PROBE } from "@/lib/github/probe-repos";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    messages?: unknown;
    story?: unknown;
    data?: unknown;
    username?: unknown;
    locale?: unknown;
    extras?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const clientData =
    body.data && typeof body.data === "object"
      ? (body.data as StoryDataSnapshot)
      : null;

  const extras =
    body.extras &&
    typeof body.extras === "object" &&
    body.extras !== null &&
    typeof (body.extras as ChatExtras).moment?.title === "string" &&
    typeof (body.extras as ChatExtras).moment?.text === "string"
      ? (body.extras as ChatExtras)
      : undefined;

  const locale: Locale = body.locale === "es" ? "es" : "en";

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter(
      (m): m is { role: ChatRole; content: string } =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-12);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required." },
      { status: 400 },
    );
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage && isOffTopic(lastUserMessage.content)) {
    return NextResponse.json({ message: dictionary[locale].chat.offTopic });
  }

  const usernameRaw =
    typeof body.username === "string"
      ? body.username
      : clientData?.username ?? "";
  const username = isValidGitHubUsername(usernameRaw)
    ? normalizeGitHubUsername(usernameRaw).toLowerCase()
    : null;

  let gitData = null;
  if (username) {
    try {
      gitData = await buildDevStoryData(username, {
        commitProbeLimit: CHAT_COMMIT_PROBE,
        questionForProbe: lastUserMessage?.content,
      });
    } catch {
      // Fall back to client snapshot + story only.
    }
  }

  try {
    const system = chatSystemPromptFromData(
      story,
      gitData,
      clientData,
      locale,
      extras,
    );
    const result = chatStream(system, messages);
    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Chat route failed:", error);
    return NextResponse.json({ error: "Chat failed." }, { status: 502 });
  }
}
