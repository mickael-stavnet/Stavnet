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

export default async function ComparisonPage({ params, searchParams }: ComparisonPageProps) {
  const [{ locale }, selection] = await Promise.all([params, searchParams.then(parseComparisonSelection)]);
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
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black">
      <Image src="/background/background.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1720px] flex-col px-3 pb-4 sm:px-5 md:px-7">
        <StavnetHeader pageName={t("header.cardTitle")} title={t("header.title")} subtitle={t("header.subtitle")} headerClassName="md:static md:h-[250px] md:shrink-0 xl:h-[146px]" logoClassName="md:left-8 md:top-4 md:bottom-auto xl:left-[clamp(58px,5.2vw,112px)] xl:top-auto xl:bottom-[8px]" badgeClassName="md:top-0 md:bottom-auto xl:top-auto xl:bottom-[8px]" titleBlockClassName="md:top-[158px] md:bottom-auto md:left-5 md:right-5 md:items-center md:text-center xl:top-auto xl:bottom-[8px] xl:left-[clamp(58px,5.2vw,112px)] xl:right-[clamp(58px,5.2vw,112px)] xl:items-end xl:text-right" titleClassName="md:text-[26px] xl:text-[35px]" subtitleClassName="md:text-[16px] xl:text-[18px]" />
        <section className="flex min-w-0 flex-1 flex-col items-center justify-center py-4 md:py-5">
          <ComparativeStatisticsDashboard selectionPath={`/${locale}/statistics`} items={items} metricLabels={selection.type === "organizations" ? { primary: t("comparison.publishedTitles"), secondary: t("comparison.publishedAuthors") } : { primary: t("comparison.originals"), secondary: t("comparison.translations") }} labels={{ dashboard: t("comparison.dashboard"), timeline: t("comparison.timeline"), table: t("comparison.table"), primary: t("comparison.primary"), secondary: t("comparison.secondary"), index: t("comparison.index"), noData: t("comparison.noData"), languages: t("comparison.languages"), countries: t("comparison.countries"), roles: t("comparison.roles"), previous: t("comparison.previous"), next: t("comparison.next"), carousel: t("comparison.carousel"), coverage: t("comparison.coverage"), comparisonTitle: t("comparison.comparisonTitle"), volumeTitle: t("comparison.volumeTitle"), activityTitle: t("comparison.activityTitle"), reachTitle: t("comparison.reachTitle"), languagesTitle: t("comparison.languagesTitle"), countriesTitle: t("comparison.countriesTitle"), rolesTitle: t("comparison.rolesTitle"), selection: t("comparison.selection"), noSelection: t("comparison.noSelection"), selectRecords: t("comparison.selectRecords") }} />
        </section>
        <StavnetFooter items={footerItems} className="md:static md:-mt-4 md:shrink-0" desktopMode="equal" />
      </div>
    </main>
  );
}
