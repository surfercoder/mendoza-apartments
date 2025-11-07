"use client";

import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter} from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('language');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const setLocale = (nextLocale: string) => {
    startTransition(() => {
      // Use the locale-aware router to switch languages
      // This will maintain the current path but change the locale
      router.replace(pathname, {locale: nextLocale as 'en' | 'es'});
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

