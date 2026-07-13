import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookDetailsPage, { generateMetadata as generateBookDetailsMetadata } from "../books/details/page";
import BookAvailabilityRoute, { generateMetadata as generateBookAvailabilityMetadata } from "../books/details/availability/page";
import BookBackCoverRoute, { generateMetadata as generateBookBackCoverMetadata } from "../books/details/back-cover/page";
import BookPressCritiquesRoute, { generateMetadata as generateBookPressCritiquesMetadata } from "../books/details/press-critiques/page";
import BookPublishingRoute, { generateMetadata as generateBookPublishingMetadata } from "../books/details/publishing/page";
import OrganizationDetailsPage, { generateMetadata as generateOrganizationDetailsMetadata } from "../orgs/details/page";
import PersonDetailsPage, { generateMetadata as generatePersonDetailsMetadata } from "../persons/details/page";
import { logInfo, logWarn } from "@/lib/server-log";

interface LegacyCatchAllPageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeSearchParams(
  input: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

function getLegacyRouteKey(slug: string[]): string {
  return slug.join("/");
}

export async function generateMetadata({ params, searchParams }: LegacyCatchAllPageProps): Promise<Metadata> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const normalizedSearchParams = normalizeSearchParams(resolvedSearchParams);
  const routeKey = getLegacyRouteKey(resolvedParams.slug);

  logInfo("LEGACY_DETAIL_ROUTE_METADATA", {
    locale: resolvedParams.locale,
    slug: resolvedParams.slug,
    routeKey,
    searchParams: normalizedSearchParams,
  });

  switch (routeKey) {
    case "persons/details":
      return generatePersonDetailsMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          name: normalizedSearchParams.name,
          fallbackFacet: normalizedSearchParams.fallbackFacet,
          fallbackValue: normalizedSearchParams.fallbackValue,
        }),
      });
    case "orgs/details":
      return generateOrganizationDetailsMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          name: normalizedSearchParams.name,
          fallbackFacet: normalizedSearchParams.fallbackFacet,
          fallbackValue: normalizedSearchParams.fallbackValue,
        }),
      });
    case "books/details":
      return generateBookDetailsMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/availability":
      return generateBookAvailabilityMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/back-cover":
      return generateBookBackCoverMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/press-critiques":
      return generateBookPressCritiquesMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/publishing":
      return generateBookPublishingMetadata({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    default:
      return {};
  }
}

export default async function LegacyCatchAllPage({ params, searchParams }: LegacyCatchAllPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const normalizedSearchParams = normalizeSearchParams(resolvedSearchParams);
  const routeKey = getLegacyRouteKey(resolvedParams.slug);

  logInfo("LEGACY_DETAIL_ROUTE_DISPATCH", {
    locale: resolvedParams.locale,
    slug: resolvedParams.slug,
    routeKey,
    searchParams: normalizedSearchParams,
  });

  switch (routeKey) {
    case "persons/details":
      return PersonDetailsPage({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          name: normalizedSearchParams.name,
          fallbackFacet: normalizedSearchParams.fallbackFacet,
          fallbackValue: normalizedSearchParams.fallbackValue,
        }),
      });
    case "orgs/details":
      return OrganizationDetailsPage({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          name: normalizedSearchParams.name,
          fallbackFacet: normalizedSearchParams.fallbackFacet,
          fallbackValue: normalizedSearchParams.fallbackValue,
        }),
      });
    case "books/details":
      return BookDetailsPage({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/availability":
      return BookAvailabilityRoute({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/back-cover":
      return BookBackCoverRoute({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/press-critiques":
      return BookPressCritiquesRoute({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    case "books/details/publishing":
      return BookPublishingRoute({
        params: Promise.resolve({ locale: resolvedParams.locale }),
        searchParams: Promise.resolve({
          id: normalizedSearchParams.id,
        }),
      });
    default:
      logWarn("LEGACY_DETAIL_ROUTE_NOT_FOUND", {
        locale: resolvedParams.locale,
        slug: resolvedParams.slug,
        routeKey,
      });
      notFound();
  }
}
