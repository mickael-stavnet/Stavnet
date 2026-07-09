import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PersonDetailPage from "../person-detail-page";
import { isBookRelatedFacet } from "@/lib/book-related";
import { redirect } from "@/i18n/routing";
import { getDefaultPersonDetail, getPersonDetailByName } from "@/lib/data/persons";
import { buildPersonPageMetadata } from "@/lib/site-metadata";
import { logInfo } from "@/lib/server-log";

interface PersonDetailsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    name?: string;
    fallbackFacet?: string;
    fallbackValue?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PersonDetailsPageProps): Promise<Metadata> {
  const [{ locale }, { name }] = await Promise.all([params, searchParams]);
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "metadata-start",
    locale,
    name: name ?? null,
  });
  const person = name ? await getPersonDetailByName(name) : await getDefaultPersonDetail();
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "metadata-resolved",
    locale,
    name: name ?? null,
    resolvedName: person?.name ?? null,
  });
  return buildPersonPageMetadata(locale, "/persons/details", person?.name);
}

export default async function PersonDetailsPage({ params, searchParams }: PersonDetailsPageProps) {
  const [{ locale }, { name, fallbackFacet, fallbackValue }] = await Promise.all([params, searchParams]);
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "page-start",
    locale,
    name: name ?? null,
    fallbackFacet: fallbackFacet ?? null,
    fallbackValue: fallbackValue ?? null,
  });
  const person = name ? await getPersonDetailByName(name) : await getDefaultPersonDetail();
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "page-resolved",
    locale,
    name: name ?? null,
    resolvedName: person?.name ?? null,
  });

  if (!person) {
    if (fallbackFacet && fallbackValue && isBookRelatedFacet(fallbackFacet)) {
      logInfo("DEBUG_LOG_INFINITE_FETCH", {
        route: "/persons/details",
        phase: "page-redirect-fallback",
        locale,
        fallbackFacet,
        fallbackValue,
      });
      redirect({
        href: {
          pathname: "/books/related",
          query: {
            facet: fallbackFacet,
            value: fallbackValue,
          },
        },
        locale,
      });
    }

    logInfo("DEBUG_LOG_INFINITE_FETCH", {
      route: "/persons/details",
      phase: "page-not-found",
      locale,
      name: name ?? null,
    });
    notFound();
  }

  return <PersonDetailPage person={person} />;
}
