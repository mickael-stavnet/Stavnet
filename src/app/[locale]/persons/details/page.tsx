import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PersonDetailPage from "../person-detail-page";
import { isBookRelatedFacet } from "@/lib/book-related";
import { redirect } from "@/i18n/routing";
import { getDefaultPersonDetail, getPersonDetailByName } from "@/lib/data/persons";
import { buildPersonPageMetadata } from "@/lib/site-metadata";

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
  const person = name ? await getPersonDetailByName(name) : await getDefaultPersonDetail();
  return buildPersonPageMetadata(locale, "/persons/details", person?.name);
}

export default async function PersonDetailsPage({ params, searchParams }: PersonDetailsPageProps) {
  const [{ locale }, { name, fallbackFacet, fallbackValue }] = await Promise.all([params, searchParams]);
  const person = name ? await getPersonDetailByName(name) : await getDefaultPersonDetail();

  if (!person) {
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

  return <PersonDetailPage person={person} />;
}
