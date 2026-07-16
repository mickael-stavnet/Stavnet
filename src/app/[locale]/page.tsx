import type { Metadata } from "next";
import HomePageClient from "./home/home-page-client";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface CoverPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CoverPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "welcome", "");
}

export default function HomePage() {
  return <HomePageClient showLanguageSwitcher />;
}
