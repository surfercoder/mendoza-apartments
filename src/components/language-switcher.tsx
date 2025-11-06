"use client";

import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useRouter, usePathname} from "next/navigation";
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
      // Replace the locale in the pathname
      const segments = pathname.split('/').filter(Boolean); // Remove empty strings
      
      // Check if first segment is a locale
      const firstSegmentIsLocale = segments.length > 0 && ['en', 'es'].includes(segments[0]);
      
      if (firstSegmentIsLocale) {
        // Replace the locale
        segments[0] = nextLocale;
      } else {
        // Add locale at the beginning
        segments.unshift(nextLocale);
      }
      
      const newPath = '/' + segments.join('/');
      router.push(newPath);
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

