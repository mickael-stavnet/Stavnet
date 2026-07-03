import type { Metadata } from "next";
import HomePageClient from "./home-page-client";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface HomeMenuPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomeMenuPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "welcome", "/home");
}

export default function HomeMenuPage() {
  return <HomePageClient />;
}
