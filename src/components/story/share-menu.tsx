"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import { Check, Code2, Link2, MessageCircle, Share2, Send } from "lucide-react";
import type { ReactNode } from "react";

const SOCIALS = ["x", "facebook", "linkedin", "whatsapp", "telegram"] as const;
type Social = (typeof SOCIALS)[number];

function socialUrl(social: Social, url: string, text: string): string {
  switch (social) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  }
}

function SocialGlyph({ social }: { social: Social }) {
  switch (social) {
    case "x":
      return (
        <span className="font-heading text-sm font-black">
          X
        </span>
      );
    case "facebook":
      return (
        <span className="font-heading text-sm font-black">f</span>
      );
    case "linkedin":
      return (
        <span className="font-heading text-sm font-black">in</span>
      );
    case "whatsapp":
      return <MessageCircle className="size-3.5" />;
    case "telegram":
      return <Send className="size-3.5" />;
  }
}

export function ShareMenu({
  url,
  text,
  className = "",
  buttonClassName = "",
}: {
  url: string;
  text: string;
  className?: string;
  buttonClassName?: string;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy(value: string, kind: "link" | "embed") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  const embedCode = `<iframe src="${url}" width="100%" height="600" style="border:2px solid #121212" loading="lazy"></iframe>`;

  const rows: { id: string; label: ReactNode; onClick: () => void }[] = [
    {
      id: "link",
      label: (
        <>
          {copied === "link" ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
          {copied === "link" ? t.share.linkCopied : t.share.copyLink}
        </>
      ),
      onClick: () => void copy(url, "link"),
    },
    {
      id: "embed",
      label: (
        <>
          {copied === "embed" ? <Check className="size-3.5" /> : <Code2 className="size-3.5" />}
          {copied === "embed" ? t.share.embedCopied : t.share.embed}
        </>
      ),
      onClick: () => void copy(embedCode, "embed"),
    },
    ...SOCIALS.map((social) => ({
      id: social,
      label: (
        <>
          <SocialGlyph social={social} />
          {t.share[social]}
        </>
      ),
      onClick: () => window.open(socialUrl(social, url, text), "_blank", "noopener"),
    })),
  ];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={buttonClassName}
      >
        <Share2 />
        {t.share.shareBtn}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-none border-2 border-foreground bg-background p-2 text-foreground shadow-hard-lg"
        >
          <p className="px-2 pt-1 pb-2 font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {t.share.shareMenuTitle}
          </p>
          <div className="flex flex-col">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                role="menuitem"
                onClick={row.onClick}
                className="flex items-center gap-2.5 px-2 py-2 text-left font-mono text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
              >
                {row.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}