import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ComparisonCandidate } from "@/components/stavnet/comparative-statistics-dashboard";
import { StatisticsExplorer } from "@/components/stavnet/statistics-explorer";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { getBooksPage } from "@/lib/data/books";
import { getPersonsPage } from "@/lib/data/persons";
import { getOrganizationsPage } from "@/lib/data/orgs";
import { parseComparisonSelection, readComparisonSearchParam, type ComparisonSearchParams } from "@/lib/comparative-statistics";
import { getExplorerStatistics, type ExplorerStatisticsFilters } from "@/lib/explorer-statistics";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface StatisticsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ComparisonSearchParams>;
}

export async function generateMetadata({ params }: StatisticsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "statistics", "/statistics");
}

export default async function StatisticsPage({ params, searchParams }: StatisticsPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const selection = parseComparisonSelection(query);
  const explorerFilters: ExplorerStatisticsFilters = {
    type: selection.type,
    fromYear: readComparisonSearchParam(query.from),
    toYear: readComparisonSearchParam(query.to),
    language: readComparisonSearchParam(query.language),
    country: readComparisonSearchParam(query.country),
    role: readComparisonSearchParam(query.role),
  };
  const [t, books, persons, organizations, explorer] = await Promise.all([
    getTranslations("StatisticsPage"),
    getBooksPage(1, 50).catch(() => ({ items: [] })),
    getPersonsPage(1, 50).catch(() => ({ items: [] })),
    getOrganizationsPage(1, 20).catch(() => ({ items: [] })),
    getExplorerStatistics(explorerFilters).catch(() => ({
      type: explorerFilters.type,
      totalRecords: 0,
      primaryCount: 0,
      secondaryCount: 0,
      statistics: { timeline: [], timelineHasMonthlyDates: false, primaryDistribution: [], secondaryDistribution: [], tertiaryDistribution: [] },
      coverage: { timeline: 0, languages: 0, countries: 0, roles: 0 },
      filterOptions: { languages: [], countries: [], roles: [] },
    })),
  ]);
  const candidates = {
    books: books.items.map((item): ComparisonCandidate => ({ id: item.id, label: item.title })),
    persons: persons.items.map((item): ComparisonCandidate => ({ id: item.name, label: item.name })),
    organizations: organizations.items.map((item): ComparisonCandidate => ({ id: item.name, label: item.name })),
  };
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/menu" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/menu" as const, label: t("footer.help") },
  ];

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0">
        <StavnetHeader pageName={t("header.cardTitle")} title={t("header.title")} subtitle={t("header.subtitle")} badgeClassName="md:bottom-[8px]" titleClassName="md:text-[35px]" subtitleClassName="md:text-[18px]" />
        <section className="mt-5 flex min-w-0 flex-col md:absolute md:left-1/2 md:top-[152px] md:bottom-[108px] md:w-[min(1240px,90vw)] md:-translate-x-1/2 md:overflow-hidden">
          <div className="border-b-2 border-[#002b9e] pb-2 text-center">
            <h1 className="text-[22px] font-bold leading-tight text-[#002b9e] md:text-[25px]">{t("title")}</h1>
            <p className="mx-auto mt-1 max-w-[88ch] text-[14px] leading-[1.25] text-[#173846]">{t("description")}</p>
          </div>
          <StatisticsExplorer filters={explorerFilters} result={explorer} candidates={candidates} initialIds={selection.ids} comparisonPath={`/${locale}/statistiques/comparaison`} basePath={`/${locale}/statistics`} labels={{ books: t("comparison.books"), persons: t("comparison.persons"), organizations: t("comparison.organizations"), filters: t("comparison.filters"), entityType: t("comparison.entityType"), all: t("comparison.all"), fromYear: t("comparison.fromYear"), toYear: t("comparison.toYear"), language: t("comparison.language"), country: t("comparison.country"), role: t("comparison.role"), apply: t("comparison.apply"), clear: t("comparison.clear"), records: t("comparison.records"), coverage: t("comparison.coverage"), dashboard: t("comparison.dashboard"), timeline: t("comparison.timeline"), table: t("comparison.table"), primary: t("comparison.primary"), secondary: t("comparison.secondary"), index: t("comparison.index"), noData: t("comparison.noData"), languages: t("comparison.languages"), countries: t("comparison.countries"), roles: t("comparison.roles"), previous: t("comparison.previous"), next: t("comparison.next"), carousel: t("comparison.carousel"), compareRecords: t("comparison.compareRecords"), compareDescription: t("comparison.compareDescription"), search: t("comparison.search"), selected: t("comparison.selected"), maximum: t("comparison.maximum"), validate: t("actions.validate") }} />
        </section>
        <StavnetFooter items={footerItems} className="md:left-[7.2vw] md:right-[7.2vw]" desktopMode="equal" />
      </div>
    </main>
  );
}
