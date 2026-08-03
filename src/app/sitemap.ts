import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-metadata";

export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/home",
  "/menu",
  "/search",
  "/books",
  "/persons",
  "/orgs",
  "/statistics",
  "/definition",
] as const;

function localizedUrl(locale: string, pathname: string): string {
  return new URL(`/${locale}${pathname}`, SITE_URL).toString();
}

function buildAlternates(pathname: string): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(locale, pathname)])),
    "x-default": localizedUrl(routing.defaultLocale, pathname),
  };
}

function entry(pathname: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl(routing.defaultLocale, pathname),
    lastModified,
    alternates: {
      languages: buildAlternates(pathname),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return STATIC_PATHS.map((pathname) => entry(pathname));
}
