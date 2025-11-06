"use client";

import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('language');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: string) => {
    startTransition(() => {
      // Persist chosen locale; next-intl reads NEXT_LOCALE
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.refresh();
    });
  };

  // Prefer emoji flags to avoid adding extra dependencies
  const currentFlag = locale === 'es' ? '🇦🇷' : '🇺🇸';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          <span aria-label={locale === 'es' ? t('ariaLabel.argentina') : t('ariaLabel.unitedStates')} title={locale === 'es' ? t('ariaLabel.argentina') : t('ariaLabel.unitedStates')}>
            {currentFlag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale('en')}>
          <span className="mr-2">🇺🇸</span> {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('es')}>
          <span className="mr-2">🇦🇷</span> {t('spanish')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

