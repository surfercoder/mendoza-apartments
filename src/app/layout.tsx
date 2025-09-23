import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import { RootProviders } from "@/components/root-providers";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mendoza Apartments - Beautiful Stays in Argentina",
  description: "Discover beautiful apartments in Mendoza, Argentina. From cozy downtown spaces to luxury penthouses with mountain views.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get?.("NEXT_LOCALE")?.value || "es";
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <RootProviders locale={locale} messages={messages}>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
