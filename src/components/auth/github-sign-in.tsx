import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github";

export function GithubSignIn({
  size = "default",
  variant = "default",
  label = "Sign in with GitHub",
}: {
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  label?: string;
}) {
  return (
    <form
      className="pointer-events-auto"
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" });
      }}
    >
      <Button type="submit" size={size} variant={variant}>
        <GithubIcon className="size-4" />
        {label}
      </Button>
    </form>
  );
}
