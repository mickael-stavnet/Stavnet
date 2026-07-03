import type { Metadata } from "next";
import SearchPageClient from "./search-page-client";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "search", "/search");
}

export default function SearchPage() {
  return <SearchPageClient />;
}
