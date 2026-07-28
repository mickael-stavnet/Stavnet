import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComparativeStatisticsDashboard } from "@/components/stavnet/comparative-statistics-dashboard";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { getComparisonItems, parseComparisonSelection, type ComparisonSearchParams } from "@/lib/comparative-statistics";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface ComparisonPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ComparisonSearchParams>;
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "statistics", "/statistiques/comparaison");
}

export default async function ComparisonPage({ searchParams }: ComparisonPageProps) {
  const selection = parseComparisonSelection(await searchParams);
  const [t, items] = await Promise.all([
    getTranslations("StatisticsPage"),
    getComparisonItems(selection).catch(() => []),
  ]);
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/statistics" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/menu" as const, label: t("footer.help") },
  ];

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0">
        <StavnetHeader pageName={t("header.cardTitle")} title={t("header.title")} subtitle={t("header.subtitle")} badgeClassName="md:bottom-[8px]" titleClassName="md:text-[35px]" subtitleClassName="md:text-[18px]" />
        <section className="mt-6 flex min-w-0 flex-col md:absolute md:left-1/2 md:top-[158px] md:bottom-[116px] md:w-[min(1240px,90vw)] md:-translate-x-1/2 md:overflow-y-auto md:pr-[4px]">
          <div className="border-b-2 border-[#002b9e] pb-3 text-center">
            <h1 className="text-[24px] font-bold leading-tight text-[#002b9e] md:text-[28px]">{t("comparison.dashboard")}</h1>
          </div>
          <ComparativeStatisticsDashboard items={items} labels={{ dashboard: t("comparison.dashboard"), timeline: t("comparison.timeline"), table: t("comparison.table"), primary: t("comparison.primary"), secondary: t("comparison.secondary"), index: t("comparison.index"), noData: t("comparison.noData"), languages: t("comparison.languages"), countries: t("comparison.countries"), roles: t("comparison.roles"), previous: t("comparison.previous"), next: t("comparison.next"), carousel: t("comparison.carousel"), coverage: t("comparison.coverage") }} />
        </section>
        <StavnetFooter items={footerItems} className="md:left-[7.2vw] md:right-[7.2vw]" desktopMode="equal" />
      </div>
    </main>
  );
}
