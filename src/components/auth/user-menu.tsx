import { auth } from "@/auth";
import { cookies } from "next/headers";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import { GithubSignIn } from "./github-sign-in";
import { UserMenuDropdown } from "./user-menu-dropdown";

export async function UserMenu() {
  const session = await auth();
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  const locale = isLocale(storedLocale) ? storedLocale : "en";
  const t = dictionary[locale];

  if (!session?.user) {
    return <GithubSignIn label={t.common.signIn} size="sm" variant="outline" />;
  }

  return (
    <UserMenuDropdown
      user={{
        name: session.user.name ?? null,
        username: session.user.username ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}