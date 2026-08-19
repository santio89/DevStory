import { auth, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GithubSignIn } from "./github-sign-in";

export async function UserMenu() {
  const session = await auth();

  if (!session?.user) {
    return <GithubSignIn size="sm" variant="outline" />;
  }

  const initial = (session.user.name ?? session.user.username ?? "D")
    ?.slice(0, 1)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {session.user.name}
      </span>
      <Avatar size="sm">
        <AvatarImage
          src={session.user.image ?? undefined}
          alt={session.user.name ?? "User"}
        />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" size="sm" variant="ghost">
          Sign out
        </Button>
      </form>
    </div>
  );
}
