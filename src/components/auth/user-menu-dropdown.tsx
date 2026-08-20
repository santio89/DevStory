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
        className="group relative rounded-full border-2 border-foreground bg-background p-0.5 shadow-hard-sm transition-all duration-200 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[calc(100%+10px)] right-0 z-50 w-64 rounded-none border-2 border-foreground bg-background shadow-hard-lg"
        >
          <div className="border-b-2 border-foreground bg-bauhaus-sky/15 px-4 py-3">
            <p className="truncate text-sm font-bold tracking-tight">
              {user.name ?? user.username ?? "Dev"}
            </p>
            {user.username && (
              <p className="truncate font-mono text-xs text-muted-foreground">
                @{user.username}
              </p>
            )}
          </div>

          <div className="p-2">
            <p className="mb-2 flex items-center gap-1.5 px-2 font-mono text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              <Languages className="size-3 text-bauhaus-deep" />
              {t.common.toggleLocale}
            </p>
            <div className="grid grid-cols-2 gap-2 px-1">
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
                    "rounded-none border-2 px-2 py-1.5 text-sm font-bold transition-all duration-200",
                    locale === code
                      ? "border-foreground bg-bauhaus-deep text-white shadow-hard-sm"
                      : "border-foreground bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-foreground p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => void signOut({ redirectTo: "/" })}
              className="flex w-full items-center gap-2 rounded-none px-2 py-2 text-sm font-bold text-bauhaus-deep transition-colors hover:bg-muted"
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