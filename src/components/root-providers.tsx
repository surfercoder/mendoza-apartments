"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

type Props = {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
};

export function RootProviders({ children, locale, messages }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NextIntlClientProvider messages={messages} locale={locale} timeZone="America/Argentina/Mendoza" now={new Date()}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
