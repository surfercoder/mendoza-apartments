"use client";
import {useLocale, useTranslations} from "next-intl";

export function useI18n(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale();
  return {t, locale};
}
