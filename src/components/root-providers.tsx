"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { Toaster } from "@/components/ui/sonner";

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
        <Toaster />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
