import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrganizationsDetailPage from "../orgs-detail-page";
import { isBookRelatedFacet } from "@/lib/book-related";
import { redirect } from "@/i18n/routing";
import { getDefaultOrganizationDetail, getOrganizationDetailByName } from "@/lib/data/orgs";
import { buildOrganizationPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

interface OrganizationDetailsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    name?: string;
    fallbackFacet?: string;
    fallbackValue?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: OrganizationDetailsPageProps): Promise<Metadata> {
  const [{ locale }, { name }] = await Promise.all([params, searchParams]);
  const organization = name ? await getOrganizationDetailByName(name) : await getDefaultOrganizationDetail();
  return buildOrganizationPageMetadata(locale, "/orgs/details", organization?.name);
}

export default async function OrganizationDetailsPage({ params, searchParams }: OrganizationDetailsPageProps) {
  const [{ locale }, { name, fallbackFacet, fallbackValue }] = await Promise.all([params, searchParams]);
  const organization = name ? await getOrganizationDetailByName(name) : await getDefaultOrganizationDetail();

  if (!organization) {
    if (fallbackFacet && fallbackValue && isBookRelatedFacet(fallbackFacet)) {
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

    notFound();
  }

  return <OrganizationsDetailPage organization={organization} />;
}
