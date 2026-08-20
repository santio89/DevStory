"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/components/locale/locale-provider";
import { setLocaleCookie } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionary";
import { Languages, LogOut } from "lucide-react";

type MenuUser = {
  name: string | null;
  username: string | null;
  image: string | null;
};

export function UserMenuDropdown({ user }: { user: MenuUser }) {
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initial = (user.name ?? user.username ?? "D")?.slice(0, 1).toUpperCase();

  function toggle() {
    setOpen((v) => !v);
  }

  async function switchLocale(next: Locale) {
    setLocale(next);
    try {
      await setLocaleCookie(next);
    } catch {}
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user.name ?? user.username ?? "Account"}
        className="group relative rounded-full bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 p-px transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none"
      >
        <Avatar className="size-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />,
            document.body,
          )
        : null}

      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[calc(100%+10px)] right-0 z-50 w-64 overflow-hidden rounded-2xl border border-border/60 bg-background/85 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.7),0_0_40px_-16px_rgba(34,211,238,0.35)] backdrop-blur-xl"
        >
                  <div className="border-b border-border/60 bg-gradient-to-r from-sky-400/[0.08] via-transparent to-cyan-400/[0.05] px-4 py-3">
                    <p className="truncate text-sm font-semibold tracking-tight">
                      {user.name ?? user.username ?? "Dev"}
                    </p>
                    {user.username && (
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    )}
                  </div>

                  <div className="p-2">
                    <p className="mb-2 flex items-center gap-1.5 px-2 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      <Languages className="size-3 text-cyan-400" />
                      {t.common.toggleLocale}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 px-1">
                      {(
                        [
                          { code: "en", label: "English" },
                          { code: "es", label: "Español" },
                        ] as const
                      ).map(({ code, label }) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => void switchLocale(code)}
                          className={cn(
                            "rounded-lg border px-2 py-1.5 text-sm font-medium transition-all duration-200",
                            locale === code
                              ? "border-sky-400/40 bg-sky-400 text-white shadow-[0_0_14px_rgba(56,189,248,0.45)]"
                              : "border-border/60 bg-muted/40 text-muted-foreground hover:border-cyan-400/40 hover:text-foreground",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/60 p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void signOut({ redirectTo: "/" })}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-pink-400 transition-colors hover:bg-pink-500/10"
                    >
                      <LogOut className="size-3.5" />
                      {t.common.signOut}
                    </button>
                  </div>
                </motion.div>
      )}
    </div>
  );
}