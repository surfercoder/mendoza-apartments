"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AdminHeader({ userEmail }: { userEmail: string }) {
  const tDash = useTranslations("admin.dashboard");
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{tDash("title")}</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          {tCommon("welcome")}: {userEmail}
        </span>
        <LanguageSwitcher />
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {tCommon("signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}
