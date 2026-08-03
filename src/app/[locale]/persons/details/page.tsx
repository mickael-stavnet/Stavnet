import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PersonDetailPage from "../person-detail-page";
import { getDefaultPersonDetail, getPersonDetailByName } from "@/lib/data/persons";
import { buildPersonPageMetadata } from "@/lib/site-metadata";
import { logInfo } from "@/lib/server-log";

export const dynamic = "force-dynamic";

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
  const trimmedName = name?.trim() ?? "";
  logInfo("PERSON_DETAILS_ROUTE_METADATA", {
    route: "/persons/details",
    phase: "start",
    locale,
    name: trimmedName || null,
  });
  const person = trimmedName ? await getPersonDetailByName(trimmedName) : await getDefaultPersonDetail();
  logInfo("PERSON_DETAILS_ROUTE_METADATA", {
    route: "/persons/details",
    phase: "resolved",
    locale,
    name: trimmedName || null,
    resolvedName: person?.name ?? null,
  });
  const canonicalName = person?.name ?? trimmedName;
  const pathname = canonicalName ? `/persons/details?name=${encodeURIComponent(canonicalName)}` : "/persons/details";
  return buildPersonPageMetadata(locale, pathname, person?.name);
}

export default async function PersonDetailsPage({ params, searchParams }: PersonDetailsPageProps) {
  const [{ locale }, { name, fallbackFacet, fallbackValue }] = await Promise.all([params, searchParams]);
  const trimmedName = name?.trim() ?? "";
  const trimmedFallbackValue = fallbackValue?.trim() ?? "";
  logInfo("PERSON_DETAILS_ROUTE_DECISION", {
    route: "/persons/details",
    phase: "start",
    locale,
    name: trimmedName || null,
    fallbackFacet: fallbackFacet ?? null,
    fallbackValue: trimmedFallbackValue || null,
  });
  const person = trimmedName ? await getPersonDetailByName(trimmedName) : await getDefaultPersonDetail();
  logInfo("PERSON_DETAILS_ROUTE_DECISION", {
    route: "/persons/details",
    phase: "resolved",
    locale,
    name: trimmedName || null,
    resolvedName: person?.name ?? null,
  });

  if (!person) {
    logInfo("PERSON_DETAILS_ROUTE_DECISION", {
      route: "/persons/details",
      phase: "not-found",
      outcome: "not_found",
      locale,
      name: trimmedName || null,
    });
    notFound();
  }

  return <PersonDetailPage person={person} />;
}
