import type { MetadataRoute } from "next";
import { d1Client } from "@/lib/d1-client";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-metadata";

export const revalidate = 3600;

type SitemapEntity = "data-books" | "data-person" | "data-organism";

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

async function getValues(table: SitemapEntity, column: "id" | "Prénom Nom" | "Organisme"): Promise<string[]> {
  const values: string[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const result = await d1Client.from<Record<string, unknown>>(table).select(column === "id" ? "id" : `"${column}"`).range(from, from + pageSize - 1);
    if (result.error || !Array.isArray(result.data)) {
      return values;
    }

    const pageValues = result.data
      .map((row) => row[column])
      .map((value) => (typeof value === "number" || typeof value === "string" ? String(value).trim() : ""))
      .filter(Boolean);

    values.push(...pageValues);

    if (result.data.length < pageSize) {
      return values;
    }

    from += pageSize;
  }
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
  const [bookIds, personIds, organizationIds] = await Promise.all([
    getValues("data-books", "id"),
    getValues("data-person", "Prénom Nom"),
    getValues("data-organism", "Organisme"),
  ]);

  const staticEntries = STATIC_PATHS.map((pathname) => entry(pathname));
  const bookEntries = bookIds.map((id) => entry(`/books/details?id=${encodeURIComponent(id)}`));
  const personEntries = personIds.map((id) => entry(`/persons/details?name=${encodeURIComponent(id)}`));
  const organizationEntries = organizationIds.map((id) => entry(`/orgs/details?name=${encodeURIComponent(id)}`));

  return [...staticEntries, ...bookEntries, ...personEntries, ...organizationEntries];
}
