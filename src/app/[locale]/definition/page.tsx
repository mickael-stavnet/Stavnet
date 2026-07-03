import type { Metadata } from "next";
import DefinitionPageClient from "./definition-page-client";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface DefinitionPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: DefinitionPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "definition", "/definition");
}

export default function DefinitionPage() {
  return <DefinitionPageClient />;
}
