"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fluidSpring } from "@/lib/motion/reveal";
import { pickChatSuggestions } from "@/lib/devstory/chat-suggestions";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { Locale } from "@/lib/i18n/dictionary";
import type { ChatExtras } from "@/lib/devstory/chat-context";
import { BookOpen, Loader2, MessageSquare, Send, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "devstory-chat";

type StoredChat = {
  byUser: Record<string, ChatMessage[]>;
};

function chatKey(scope: string, locale: Locale): string {
  return `${scope}|${locale}`;
}

function hasUserMessages(messages: ChatMessage[]): boolean {
  return messages.some((m) => m.role === "user");
}

function readStored(scope: string, locale: Locale): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredChat & {
      byLocale?: Record<string, ChatMessage[]>;
    };
    const messages =
      parsed?.byUser?.[chatKey(scope, locale)] ?? parsed?.byLocale?.[locale];
    if (!Array.isArray(messages)) return [];
    const filtered = messages.filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    );
    // Greeting is ephemeral — only restore threads the user actually started.
    return hasUserMessages(filtered) ? filtered : [];
  } catch {
    return [];
  }
}

function writeStored(
  scope: string,
  locale: Locale,
  messages: ChatMessage[],
) {
  if (!hasUserMessages(messages)) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as StoredChat)
      : { byUser: {} };
    const byUser =
      parsed?.byUser && typeof parsed.byUser === "object"
        ? parsed.byUser
        : {};
    const key = chatKey(scope, locale);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        byUser: { ...byUser, [key]: messages },
      } satisfies StoredChat),
    );
  } catch {}
}

function apiMessages(
  messages: ChatMessage[],
  greeting: string,
): ChatMessage[] {
  return messages.filter(
    (m) => !(m.role === "assistant" && m.content === greeting),
  );
}

function readStoredMoment(
  fingerprint: string,
  locale: Locale,
): ChatExtras["moment"] | undefined {
  try {
    const raw = window.localStorage.getItem("devstory-moment");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as {
      fingerprint?: string;
      byLocale?: Record<
        string,
        { title: string; text: string; year: string; dateLabel?: string }
      >;
    };
    if (parsed.fingerprint !== fingerprint) return undefined;
    return parsed.byLocale?.[locale];
  } catch {
    return undefined;
  }
}

export function StoryChat({
  story,
  data,
  username,
  storageScope,
}: {
  story: DevStory;
  data: StoryDataSnapshot | null;
  username: string;
  storageScope?: string;
}) {
  const chatScope = storageScope ?? username;
  const fingerprint = story.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setOpen(false);
      setMessages(readStored(chatScope, locale));
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [chatScope, locale]);

  useEffect(() => {
    if (!hydrated || messages.length === 0) return;
    writeStored(chatScope, locale, messages);
  }, [messages, chatScope, locale, hydrated]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming, open]);

  function openChat() {
    setOpen(true);
    if (hydrated) {
      queueMicrotask(() => {
        setMessages((prev) =>
          prev.length > 0
            ? prev
            : [{ role: "assistant", content: t.chat.greeting }],
        );
        window.setTimeout(() => inputRef.current?.focus(), 80);
      });
    }
  }

  function toggleChat() {
    if (open) {
      setOpen(false);
      return;
    }
    openChat();
  }

  async function send(messageText?: string) {
    const content = (messageText ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    setError(null);

    const greeting = t.chat.greeting;
    const next: ChatMessage[] = [
      ...apiMessages(messages, greeting),
      { role: "user", content },
    ];
    setMessages([...messages, { role: "user", content }]);
    setStreaming(true);

    const moment = readStoredMoment(fingerprint, locale);

    try {
      const res = await fetch("/api/story/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          story,
          data,
          username,
          locale,
          extras: moment ? { moment } : undefined,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 503) {
          throw new Error(t.chat.noAI);
        }
        throw new Error(json.error ?? t.chat.failed);
      }
      if (res.headers.get("content-type")?.includes("application/json")) {
        const json = (await res.json()) as { message?: string };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.message ?? t.chat.failed },
        ]);
        return;
      }
      if (!res.body) throw new Error(t.chat.failed);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const content = acc;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content };
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.chat.failed);
    } finally {
      setStreaming(false);
    }
  }

  const showSuggestions = !messages.some((m) => m.role === "user");
  const awaitingReply =
    streaming && messages[messages.length - 1]?.role === "user";

  const suggestions = pickChatSuggestions({
    username,
    story,
    data,
    pool: t.chat.suggestionPool,
    count: 3,
    seed: `${fingerprint}|${locale}`,
  });

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={fluidSpring}
            className="fixed right-4 bottom-20 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col rounded-none border-2 border-foreground bg-background text-foreground shadow-hard-lg sm:right-6 sm:bottom-24"
          >
            <div className="flex items-center justify-between border-b-2 border-foreground bg-bauhaus-deep px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-bauhaus-yellow" />
                <div>
                  <p className="font-heading text-sm font-black tracking-normal text-balance uppercase">
                    {t.chat.title}
                  </p>
                  <p className="font-mono text-[10px] text-white/70 tracking-wide">
                    {t.chat.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.chat.close}
                className="p-1 transition-colors hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex max-h-[50vh] min-h-56 flex-col gap-3 overflow-y-auto p-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "self-end max-w-[85%] rounded-none border-2 border-foreground bg-bauhaus-yellow px-3 py-2 font-mono text-sm font-bold text-balance text-bauhaus-ink"
                      : "self-start max-w-[90%] rounded-none border-2 border-foreground bg-muted px-3 py-2.5 text-sm leading-relaxed text-pretty text-foreground"
                  }
                >
                  {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}
              {awaitingReply && (
                <p className="self-start font-mono text-xs tracking-wide text-muted-foreground italic">
                  {t.chat.thinking}
                </p>
              )}
              {showSuggestions && (
                <div className="flex flex-col gap-1.5 pt-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={streaming}
                      onClick={() => void send(suggestion)}
                      className="rounded-none border border-dashed border-foreground/40 px-2.5 py-2 text-left text-xs leading-snug text-muted-foreground transition-colors hover:border-foreground hover:bg-background hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {error && (
                <p className="font-mono text-xs font-bold text-destructive uppercase">
                  {error}
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex items-center gap-2 border-t-2 border-foreground p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chat.placeholder}
                disabled={streaming}
                className="h-10 flex-1 rounded-none border-2 border-foreground bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-bauhaus-deep focus:outline-none disabled:opacity-50"
              />
              <Button type="submit" size="sm" disabled={streaming || !input.trim()}>
                {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {t.chat.send}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fluidSpring, delay: 0.35 }}
      >
        <Button
          onClick={toggleChat}
          aria-expanded={open}
        >
          {open ? <X /> : <MessageSquare />}
          {t.chat.open}
        </Button>
      </motion.div>
    </>
  );
}
