import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { PageMotion } from "@/components/stavnet/page-motion";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
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
      <Script id="google-tag-manager" strategy="beforeInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NGRF2WB7');`}
      </Script>
      <body className="min-h-full flex flex-col relative">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NGRF2WB7"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <SiteJsonLd locale={locale} description={String(buildSiteMetadata(locale).description ?? "")} />
        <NextIntlClientProvider messages={messages}>
          <PageMotion>{children}</PageMotion>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
