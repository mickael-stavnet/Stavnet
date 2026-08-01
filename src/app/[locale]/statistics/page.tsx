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
import { emptyGeneralStatistics, getGeneralStatistics, type GeneralStatisticsFilters } from "@/lib/general-statistics";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface StatisticsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ComparisonSearchParams>;
}

function analysisLabels(locale: string) {
  const french = locale === "fr";
  return french ? {
    filterBar: "Filtres d’analyse", period: "Période", allPeriod: "Toute la période", lastTenYears: "10 dernières années", lastTwentyFiveYears: "25 dernières années", currentDecade: "Décennie en cours", customPeriod: "Période personnalisée", fromYear: "De l’année", toYear: "À l’année", allLanguages: "Toutes les langues", allCountries: "Tous les pays", allPublishers: "Tous les éditeurs", publisher: "Éditeur", scope: "Périmètre analysé : {period} · {language} · {country} · {publisher}.", periodRange: "de {from} à {to}", pocketScope: "Périmètre analysé : données biographiques disponibles.", birthCountriesScope: "Périmètre analysé : auteurs dont le pays de naissance est identifié.", filtersUnavailable: "Aucun filtre bibliographique fiable n’est disponible pour cette analyse.", timelineTitle: "Évolution par décennie du nombre d’ouvrages originaux et de traductions publiés.", originalAuthorsTitle: "Auteurs classés selon le nombre d’ouvrages originaux publiés.", translatedBooksTitle: "Ouvrages classés selon leur nombre de traductions publiées.", translatedAuthorsTitle: "Auteurs classés selon le nombre d’ouvrages traduits publiés.", originalPublishersTitle: "Éditeurs classés selon le nombre d’ouvrages originaux publiés.", translatorsTitle: "Traducteurs classés selon le nombre de traductions publiées.", translationPublishersTitle: "Éditeurs classés selon le nombre de traductions publiées.", pocketReissuesTitle: "Auteurs classés selon leur nombre de rééditions au format poche.", languagesTitle: "Ouvrages publiés classés par langue de publication.", countriesTitle: "Répartition des ouvrages publiés par pays de publication.", genresTitle: "Répartition des ouvrages publiés par genre d’écriture.", birthCountriesTitle: "Répartition des auteurs par pays de naissance.", writingGenres: "Genres d’écriture", works: "Ouvrages", authors: "Auteurs", otherGenres: "Autres genres",
  } : {
    filterBar: "Analysis filters", period: "Period", allPeriod: "Entire period", lastTenYears: "Last 10 years", lastTwentyFiveYears: "Last 25 years", currentDecade: "Current decade", customPeriod: "Custom period", fromYear: "From year", toYear: "To year", allLanguages: "All languages", allCountries: "All countries", allPublishers: "All publishers", publisher: "Publisher", scope: "Analysis scope: {period} · {language} · {country} · {publisher}.", periodRange: "from {from} to {to}", pocketScope: "Analysis scope: available biographical data.", birthCountriesScope: "Analysis scope: authors whose country of birth is identified.", filtersUnavailable: "No reliable bibliographic filter is available for this analysis.", timelineTitle: "Change by decade in the number of original works and translations published.", originalAuthorsTitle: "Authors ranked by the number of original works published.", translatedBooksTitle: "Works ranked by the number of published translations.", translatedAuthorsTitle: "Authors ranked by the number of published translated works.", originalPublishersTitle: "Publishers ranked by the number of original works published.", translatorsTitle: "Translators ranked by the number of published translations.", translationPublishersTitle: "Publishers ranked by the number of published translations.", pocketReissuesTitle: "Authors ranked by their number of pocket-format reissues.", languagesTitle: "Published works ranked by publication language.", countriesTitle: "Breakdown of works published by country of publication.", genresTitle: "Breakdown of published works by writing genre.", birthCountriesTitle: "Breakdown of authors by country of birth.", writingGenres: "Writing genres", works: "Works", authors: "Authors", otherGenres: "Other genres",
  };
}

export async function generateMetadata({ params }: StatisticsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "statistics", "/statistics");
}

export default async function StatisticsPage({ params, searchParams }: StatisticsPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const readYear = (value: string | string[] | undefined) => {
    const year = Number(readComparisonSearchParam(value));
    return Number.isSafeInteger(year) && year >= 1500 && year <= 2099 ? year : undefined;
  };
  const filters: GeneralStatisticsFilters = {
    fromYear: readYear(query.fromYear),
    toYear: readYear(query.toYear),
    language: readComparisonSearchParam(query.language),
    country: readComparisonSearchParam(query.country),
    publisher: readComparisonSearchParam(query.publisher),
  };
  const [t, books, persons, organizations, statistics] = await Promise.all([
    getTranslations("StatisticsPage"),
    getBooksPage(1, 50).catch(() => ({ items: [] })),
    getPersonsPage(1, 50).catch(() => ({ items: [] })),
    getOrganizationsPage(1, 20).catch(() => ({ items: [] })),
    getGeneralStatistics(filters).catch(() => emptyGeneralStatistics),
  ]);
  const candidates = {
    books: books.items.map((item): ComparisonCandidate => ({ id: item.id, label: item.title })),
    persons: persons.items.map((item): ComparisonCandidate => ({ id: item.name, label: item.name })),
    organizations: organizations.items.map((item): ComparisonCandidate => ({ id: item.name, label: item.name })),
  };
  const analysis = analysisLabels(locale);
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/menu" as const, label: t("footer.back") },
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
          <GeneralStatisticsDashboard data={statistics} filters={filters} candidates={candidates} comparisonPath={`/${locale}/statistiques/comparaison`} basePath={`/${locale}/statistics`} labels={{ dashboard: t("comparison.dashboard"), timeline: t("comparison.timeline"), originals: t("comparison.originals"), translations: t("comparison.translations"), language: t("comparison.language"), all: t("comparison.all"), noData: t("comparison.noData"), previous: t("comparison.previous"), next: t("comparison.next"), carousel: t("comparison.carousel"), ranking: t("comparison.ranking"), podium: t("comparison.podium"), page: t("comparison.page"), originalAuthors: t("comparison.originalAuthors"), translatedBooks: t("comparison.translatedBooks"), translatedAuthors: t("comparison.translatedAuthors"), originalPublishers: t("comparison.originalPublishers"), translators: t("comparison.translators"), translationPublishers: t("comparison.translationPublishers"), pocketReissues: t("comparison.pocketReissues"), publicationLanguages: t("comparison.publicationLanguages"), publicationCountries: t("comparison.publicationCountries"), compareRecords: t("comparison.compareRecords"), compareDescription: t("comparison.compareDescription"), books: t("comparison.books"), persons: t("comparison.persons"), organizations: t("comparison.organizations"), search: t("comparison.search"), selected: t("comparison.selected"), maximum: t("comparison.maximum"), validate: t("actions.validate"), ...analysis }} />
        </section>
        <StavnetFooter items={footerItems} className="md:static md:-mt-4 md:shrink-0" desktopMode="equal" />
      </div>
    </main>
  );
}
