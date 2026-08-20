"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { Bot, Loader2, MessageSquare, Send, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function StoryChat({
  story,
  data,
}: {
  story: DevStory;
  data: StoryDataSnapshot | null;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming, open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setMessages([{ role: "assistant", content: t.chat.greeting }]);
    });
    const focusTimer = window.setTimeout(
      () => inputRef.current?.focus(),
      80,
    );
    return () => {
      active = false;
      window.clearTimeout(focusTimer);
    };
  }, [open, t.chat.greeting]);

  async function send() {
    const content = input.trim();
    if (!content || streaming) return;
    setInput("");
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/story/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, story, data }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? t.chat.failed);
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

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 bottom-20 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col rounded-none border-2 border-foreground bg-background text-foreground shadow-hard-lg sm:right-6 sm:bottom-24"
          >
            <div className="flex items-center justify-between border-b-2 border-foreground bg-bauhaus-deep px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-bauhaus-yellow" />
                <div>
                  <p className="font-heading text-sm font-black tracking-normal uppercase">
                    {t.chat.title}
                  </p>
                  <p className="font-mono text-[10px] text-white/70 uppercase">
                    {t.chat.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
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
                      ? "self-end max-w-[85%] rounded-none border-2 border-foreground bg-bauhaus-yellow px-3 py-2 font-mono text-sm font-bold text-bauhaus-ink"
                      : "self-start max-w-[90%] rounded-none border-2 border-foreground bg-muted px-3 py-2 font-mono text-sm text-foreground"
                  }
                >
                  {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}
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

      <Button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
      >
        {open ? <X /> : <MessageSquare />}
        {t.chat.open}
      </Button>
    </>
  );
}