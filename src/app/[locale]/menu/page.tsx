import type { Metadata } from "next";
import MenuPageClient from "./menu-page-client";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface MenuPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "menu", "/menu");
}

export default function MenuPage() {
  return <MenuPageClient />;
}
