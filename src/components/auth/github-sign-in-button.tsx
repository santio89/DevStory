"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github";

export function GithubSignInButton({
  size = "default",
  variant = "default",
  label = "Sign in with GitHub",
}: {
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  label?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size={size} variant={variant} disabled={pending} aria-busy={pending}>
      {pending ? (
        <Loader2 className="size-5 animate-spin" aria-hidden />
      ) : (
        <>
          <GithubIcon className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
