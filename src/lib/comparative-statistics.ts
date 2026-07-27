import type { ComparisonItem, ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";
import { getBookDetailById, type BookDetail } from "@/lib/data/books";
import { getOrganizationDetailByName, type OrganizationDetail } from "@/lib/data/orgs";
import { getPersonDetailByName, type PersonDetail } from "@/lib/data/persons";

export const MAX_COMPARISON_ITEMS = 5;

export interface ComparisonSelection {
  type: ComparisonType;
  ids: string[];
}

export interface ComparisonSearchParams {
  type?: string | string[];
  ids?: string | string[];
}

const COMPARISON_TYPES: readonly ComparisonType[] = ["books", "persons", "organizations"];

function isComparisonType(value: string): value is ComparisonType {
  return COMPARISON_TYPES.includes(value as ComparisonType);
}

function readSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readCount(value: string): number {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeIds(value: string): string[] {
  const ids: string[] = [];

  for (const rawId of value.split(",")) {
    const id = rawId.trim();

    if (id && !ids.includes(id)) {
      ids.push(id);
    }

    if (ids.length === MAX_COMPARISON_ITEMS) {
      break;
    }
  }

  return ids;
}

export function parseComparisonSelection(searchParams: ComparisonSearchParams): ComparisonSelection {
  const requestedType = readSearchParam(searchParams.type).trim();

  return {
    type: isComparisonType(requestedType) ? requestedType : "books",
    ids: normalizeIds(readSearchParam(searchParams.ids)),
  };
}

function mapBookComparisonItem(detail: BookDetail): ComparisonItem {
  const primaryCount = detail.publishing.filter((item) => item.status === "O").length;
  const secondaryCount = detail.publishing.filter((item) => item.status !== "O").length;

  return {
    id: detail.id,
    label: detail.title,
    statistics: detail.statistics,
    primaryCount,
    secondaryCount,
  };
}

function mapPersonComparisonItem(id: string, detail: PersonDetail): ComparisonItem {
  return {
    id,
    label: detail.name,
    statistics: detail.statistics,
    primaryCount: readCount(detail.bibliographyStats.originalTitles),
    secondaryCount: readCount(detail.bibliographyStats.translations),
  };
}

function mapOrganizationComparisonItem(id: string, detail: OrganizationDetail): ComparisonItem {
  return {
    id,
    label: detail.name,
    statistics: detail.statistics,
    primaryCount: readCount(detail.publishedStats.titles),
    secondaryCount: readCount(detail.publishedStats.authors),
  };
}

async function getBookComparisonItems(ids: string[]): Promise<ComparisonItem[]> {
  const details = await Promise.all(ids.map((id) => getBookDetailById(id)));
  return details.flatMap((detail) => detail ? [mapBookComparisonItem(detail)] : []);
}

async function getPersonComparisonItems(ids: string[]): Promise<ComparisonItem[]> {
  const details = await Promise.all(ids.map((id) => getPersonDetailByName(id)));
  return details.flatMap((detail, index) => {
    const id = ids[index];
    return detail && id ? [mapPersonComparisonItem(id, detail)] : [];
  });
}

async function getOrganizationComparisonItems(ids: string[]): Promise<ComparisonItem[]> {
  const details = await Promise.all(ids.map((id) => getOrganizationDetailByName(id)));
  return details.flatMap((detail, index) => {
    const id = ids[index];
    return detail && id ? [mapOrganizationComparisonItem(id, detail)] : [];
  });
}

export async function getComparisonItems(selection: ComparisonSelection): Promise<ComparisonItem[]> {
  if (selection.ids.length === 0) {
    return [];
  }

  switch (selection.type) {
    case "books":
      return getBookComparisonItems(selection.ids);
    case "persons":
      return getPersonComparisonItems(selection.ids);
    case "organizations":
      return getOrganizationComparisonItems(selection.ids);
  }
}
