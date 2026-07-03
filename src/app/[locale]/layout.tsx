import type { Metadata } from "next";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { PageMotion } from "@/components/stavnet/page-motion";
import { buildSiteMetadata } from "@/lib/site-metadata";

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

type AppLocale = (typeof routing.locales)[number];

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSiteMetadata(locale);
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", "font-sans")}
      dir={locale === "ar" || locale === "he" ? "rtl" : "ltr"}
    >
      <body className="min-h-full flex flex-col relative">
        <NextIntlClientProvider messages={messages}>
          <PageMotion>{children}</PageMotion>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
