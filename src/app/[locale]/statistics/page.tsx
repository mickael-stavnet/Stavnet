import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ComparisonCandidate } from "@/components/stavnet/comparative-statistics-dashboard";
import { GeneralStatisticsDashboard } from "@/components/stavnet/general-statistics-dashboard";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { getBooksPage } from "@/lib/data/books";
import { getPersonsPage } from "@/lib/data/persons";
import { getOrganizationsPage } from "@/lib/data/orgs";
import { readComparisonSearchParam, type ComparisonSearchParams } from "@/lib/comparative-statistics";
import { emptyGeneralStatistics, getGeneralStatistics } from "@/lib/general-statistics";
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
  const language = readComparisonSearchParam(query.language);
  const [t, books, persons, organizations, statistics] = await Promise.all([
    getTranslations("StatisticsPage"),
    getBooksPage(1, 50).catch(() => ({ items: [] })),
    getPersonsPage(1, 50).catch(() => ({ items: [] })),
    getOrganizationsPage(1, 20).catch(() => ({ items: [] })),
    getGeneralStatistics(language).catch(() => emptyGeneralStatistics),
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
      <Image src="/background/background.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0">
        <StavnetHeader pageName={t("header.cardTitle")} title={t("header.title")} subtitle={t("header.subtitle")} badgeClassName="md:bottom-[8px]" titleClassName="md:text-[35px]" subtitleClassName="md:text-[18px]" />
        <section className="mt-5 flex min-w-0 flex-col md:absolute md:left-1/2 md:top-[128px] md:bottom-[108px] md:mt-0 md:w-[min(1240px,90vw)] md:-translate-x-1/2 md:overflow-hidden">
          <GeneralStatisticsDashboard data={statistics} initialLanguage={language} candidates={candidates} comparisonPath={`/${locale}/statistiques/comparaison`} basePath={`/${locale}/statistics`} labels={{ dashboard: t("comparison.dashboard"), timeline: t("comparison.timeline"), originals: t("comparison.originals"), translations: t("comparison.translations"), language: t("comparison.language"), all: t("comparison.all"), noData: t("comparison.noData"), previous: t("comparison.previous"), next: t("comparison.next"), carousel: t("comparison.carousel"), ranking: t("comparison.ranking"), podium: t("comparison.podium"), page: t("comparison.page"), originalAuthors: t("comparison.originalAuthors"), translatedBooks: t("comparison.translatedBooks"), translatedAuthors: t("comparison.translatedAuthors"), originalPublishers: t("comparison.originalPublishers"), translators: t("comparison.translators"), translationPublishers: t("comparison.translationPublishers"), pocketReissues: t("comparison.pocketReissues"), publicationLanguages: t("comparison.publicationLanguages"), publicationCountries: t("comparison.publicationCountries"), compareRecords: t("comparison.compareRecords"), compareDescription: t("comparison.compareDescription"), books: t("comparison.books"), persons: t("comparison.persons"), organizations: t("comparison.organizations"), search: t("comparison.search"), selected: t("comparison.selected"), maximum: t("comparison.maximum"), validate: t("actions.validate") }} />
        </section>
        <StavnetFooter items={footerItems} className="md:left-[7.2vw] md:right-[7.2vw]" desktopMode="equal" />
      </div>
    </main>
  );
}
