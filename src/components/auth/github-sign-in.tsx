import { signInWithGithub } from "@/app/actions";
import { GithubSignInButton } from "@/components/auth/github-sign-in-button";

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
    <form className="pointer-events-auto" action={signInWithGithub}>
      <GithubSignInButton label={label} size={size} variant={variant} />
    </form>
  );
}
