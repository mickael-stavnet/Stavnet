import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { fixEncoding } from "@/lib/encoding";
import { logError, logInfo, logWarn } from "@/lib/server-log";

export const ORGS_PAGE_SIZE = 13;
export const ORGANIZATION_CATEGORY_VALUES = ["Editeur", "Bibliothèque", "AutreOrganisme"] as const;

export type OrganizationCategoryValue = (typeof ORGANIZATION_CATEGORY_VALUES)[number];

type OrganizationPageItemRpc = {
  name?: unknown;
  type?: unknown;
  creationDate?: unknown;
  country?: unknown;
  publishedTitles?: unknown;
  publishedAuthors?: unknown;
};

type OrganizationPageRpc = {
  items?: OrganizationPageItemRpc[] | null;
  totalCount?: unknown;
  databaseTotal?: unknown;
} | null;

type OrganizationBookSourceRow = Record<string, unknown>;

type OrganizationDetailRpc = {
  name?: unknown;
  synonym?: unknown;
  type?: unknown;
  creationDate?: unknown;
  country?: unknown;
  publishedStats?: {
    titles?: unknown;
    authors?: unknown;
  } | null;
  stats?: {
    cardsFound?: unknown;
    databaseContains?: unknown;
  } | null;
} | null;

export interface OrganizationListItem {
  name: string;
  type: string;
  creationDate: string;
  country: string;
  publishedTitles: string;
  publishedAuthors: string;
}

export interface OrganizationDetail {
  name: string;
  synonym: string;
  type: string;
  creationDate: string;
  country: string;
  publishedRows: {
    title: string;
    author: string;
    year: string;
  }[];
  publishedStats: {
    titles: string;
    authors: string;
  };
  stats: {
    cardsFound: string;
    databaseContains: string;
  };
}

export interface OrganizationListResult {
  items: OrganizationListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  databaseTotal: number;
}

function readText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return fixEncoding(String(value)).trim();
}

function readCount(value: unknown): string {
  const text = readText(value);
  return text || "0";
}

function readNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapOrganizationListItem(item: OrganizationPageItemRpc): OrganizationListItem {
  return {
    name: readText(item.name),
    type: readText(item.type),
    creationDate: readText(item.creationDate),
    country: readText(item.country),
    publishedTitles: readCount(item.publishedTitles),
    publishedAuthors: readCount(item.publishedAuthors),
  };
}

function normalizeOrganizationValue(value: string): string {
  return readText(value).toLocaleLowerCase();
}

function isLibraryOrganization(name: string): boolean {
  return normalizeOrganizationValue(name).includes("bibli");
}

function joinName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter((value) => value.length > 0).join(" ");
}

function readSourceField(row: Record<string, unknown>, candidates: string[]): string {
  for (const candidate of candidates) {
    if (candidate in row) {
      return readText(row[candidate]);
    }
  }

  return "";
}

async function fetchAllOrganizationTableRows(
  table: "data-organism" | "data-books",
  select: string,
  batchSize = 1000,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const batch = Array.isArray(data) ? (data as unknown as Record<string, unknown>[]) : [];
    rows.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  return rows;
}

async function getOrganizationsDatabaseTotal(): Promise<number> {
  const { count, error } = await supabase
    .from("data-organism")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

function mapOrganizationDetail(detail: OrganizationDetailRpc): OrganizationDetail | null {
  if (!detail) {
    return null;
  }

  return {
    name: readText(detail.name),
    synonym: readText(detail.synonym),
    type: readText(detail.type),
    creationDate: readText(detail.creationDate),
    country: readText(detail.country),
    publishedRows: [],
    publishedStats: {
      titles: readCount(detail.publishedStats?.titles),
      authors: readCount(detail.publishedStats?.authors),
    },
    stats: {
      cardsFound: readCount(detail.stats?.cardsFound),
      databaseContains: readCount(detail.stats?.databaseContains),
    },
  };
}

async function fetchOrganizationPublishedRows(name: string, synonym: string): Promise<OrganizationDetail["publishedRows"]> {
  const normalizedNames = [name, synonym]
    .map((value) => normalizeOrganizationValue(value))
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

  if (normalizedNames.length === 0) {
    return [];
  }

  const data = await fetchAllOrganizationTableRows(
    "data-books",
    'id,"Titre","Année","Auteur. 1. Prénom","Auteur. 1. Nom","Éditeur","Éditeur. 1. Nom","Éditeur. 2. Nom"',
  );

  const rows = data
    .filter((row) => {
      const sourceRow = row as OrganizationBookSourceRow;
      const publisherNames = [
        readSourceField(sourceRow, ["Éditeur"]),
        readSourceField(sourceRow, ["Éditeur. 1. Nom"]),
        readSourceField(sourceRow, ["Éditeur. 2. Nom"]),
      ];

      return publisherNames.some((publisherName) => normalizedNames.includes(normalizeOrganizationValue(publisherName)));
    })
    .map((row) => {
      const sourceRow = row as OrganizationBookSourceRow;

      return {
        title: readSourceField(sourceRow, ["Titre"]),
        author: joinName(
          readSourceField(sourceRow, ["Auteur. 1. Prénom"]),
          readSourceField(sourceRow, ["Auteur. 1. Nom"]),
        ),
        year: readSourceField(sourceRow, ["Année"]),
      };
    })
    .filter((row) => row.title.length > 0);

  const seen = new Set<string>();

  return rows.filter((row) => {
    const key = [row.title, row.author, row.year].map((value) => normalizeOrganizationValue(value)).join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function enrichOrganizationPublishedRows(detail: OrganizationDetail): Promise<OrganizationDetail> {
  const publishedRows = await fetchOrganizationPublishedRows(detail.name, detail.synonym);

  return {
    ...detail,
    publishedRows,
  };
}

function buildOrganizationsListResult(
  payload: OrganizationPageRpc,
  currentPage: number,
  pageSize: number,
): OrganizationListResult {
  const items = Array.isArray(payload?.items) ? payload.items.map(mapOrganizationListItem) : [];
  const total = readNumber(payload?.totalCount);
  const databaseTotal = readNumber(payload?.databaseTotal);

  return {
    items,
    page: currentPage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    databaseTotal,
  };
}

async function fetchOrganizationsPagePayload(
  page: number,
  pageSize: number,
  searchTerm?: string,
): Promise<OrganizationPageRpc> {
  const currentPage = Math.max(1, page);
  const trimmedSearchTerm = searchTerm?.trim() ?? "";

  logInfo("ORGS_RPC_PAGE_START", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
  });

  const { data, error, status, statusText } = await supabase.rpc("get_organizations_page", {
    p_page: currentPage,
    p_page_size: pageSize,
    p_search: trimmedSearchTerm.length > 0 ? trimmedSearchTerm : null,
  });

  if (error) {
    logError("ORGS_RPC_PAGE_ERROR", {
      page: currentPage,
      pageSize,
      searchTerm: trimmedSearchTerm || null,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  logInfo("ORGS_RPC_PAGE_RESULT", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    status,
    statusText,
    itemCount: Array.isArray((data as OrganizationPageRpc)?.items)
      ? (data as OrganizationPageRpc)?.items?.length ?? 0
      : 0,
    totalCount: readNumber((data as OrganizationPageRpc)?.totalCount),
    databaseTotal: readNumber((data as OrganizationPageRpc)?.databaseTotal),
  });

  return (data as OrganizationPageRpc) ?? null;
}

export async function getOrganizationsPage(
  page: number,
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const payload = await fetchOrganizationsPagePayload(currentPage, pageSize);
  return buildOrganizationsListResult(payload, currentPage, pageSize);
}

export async function getOrganizationsPageByName(
  page: number,
  searchTerm: string,
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const payload = await fetchOrganizationsPagePayload(currentPage, pageSize, searchTerm);
  return buildOrganizationsListResult(payload, currentPage, pageSize);
}

export async function getOrganizationsPageByType(
  page: number,
  type: string,
  searchTerm = "",
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const trimmedType = type.trim();
  const trimmedSearchTerm = searchTerm.trim();

  if (!trimmedType) {
    return getOrganizationsPage(currentPage, pageSize);
  }

  const normalizedType = normalizeOrganizationValue(trimmedType);
  const normalizedSearchTerm = normalizeOrganizationValue(trimmedSearchTerm);

  const [data, databaseTotal] = await Promise.all([
    fetchAllOrganizationTableRows("data-organism", 'id,"Organisme","Type","Date_Creation","Pays","Nb_Titres","Nb_Auteurs"'),
    getOrganizationsDatabaseTotal(),
  ]);

  const filteredItems = data
    .map((row) =>
      mapOrganizationListItem({
        name: row["Organisme"],
        type: row["Type"],
        creationDate: row["Date_Creation"],
        country: row["Pays"],
        publishedTitles: row["Nb_Titres"],
        publishedAuthors: row["Nb_Auteurs"],
      }),
    )
    .filter((item) => item.name.length > 0)
    .filter((item) => normalizeOrganizationValue(item.type) === normalizedType)
    .filter((item) => !normalizedSearchTerm || normalizeOrganizationValue(item.name).includes(normalizedSearchTerm))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));

  const start = (currentPage - 1) * pageSize;
  const items = filteredItems.slice(start, start + pageSize);

  return {
    items,
    page: currentPage,
    pageSize,
    total: filteredItems.length,
    totalPages: Math.max(1, Math.ceil(filteredItems.length / pageSize)),
    databaseTotal,
  };
}

export async function getOrganizationsPageByCategory(
  page: number,
  category: OrganizationCategoryValue,
  searchTerm = "",
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const normalizedCategory = normalizeOrganizationValue(category);
  const normalizedSearchTerm = normalizeOrganizationValue(searchTerm);

  const [data, databaseTotal] = await Promise.all([
    fetchAllOrganizationTableRows("data-organism", 'id,"Organisme","Type","Date_Creation","Pays","Nb_Titres","Nb_Auteurs"'),
    getOrganizationsDatabaseTotal(),
  ]);

  const filteredItems = data
    .map((row) =>
      mapOrganizationListItem({
        name: row["Organisme"],
        type: row["Type"],
        creationDate: row["Date_Creation"],
        country: row["Pays"],
        publishedTitles: row["Nb_Titres"],
        publishedAuthors: row["Nb_Auteurs"],
      }),
    )
    .filter((item) => item.name.length > 0)
    .filter((item) => {
      const normalizedType = normalizeOrganizationValue(item.type);
      const isLibrary = isLibraryOrganization(item.name);

      if (normalizedCategory === normalizeOrganizationValue("Editeur")) {
        return normalizedType === normalizeOrganizationValue("Editeur");
      }

      if (normalizedCategory === normalizeOrganizationValue("Bibliothèque")) {
        return normalizedType === normalizeOrganizationValue("AutreOrganisme") && isLibrary;
      }

      return normalizedType === normalizeOrganizationValue("AutreOrganisme") && !isLibrary;
    })
    .filter((item) => !normalizedSearchTerm || normalizeOrganizationValue(item.name).includes(normalizedSearchTerm))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));

  const start = (currentPage - 1) * pageSize;
  const items = filteredItems.slice(start, start + pageSize);

  return {
    items,
    page: currentPage,
    pageSize,
    total: filteredItems.length,
    totalPages: Math.max(1, Math.ceil(filteredItems.length / pageSize)),
    databaseTotal,
  };
}

export const getOrganizationDetailByName = cache(async (name: string): Promise<OrganizationDetail | null> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    logWarn("ORGS_RPC_DETAIL_EMPTY_NAME", { rawName: name });
    return null;
  }

  logInfo("ORGS_RPC_DETAIL_START", {
    name: trimmedName,
  });

  const { data, error, status, statusText } = await supabase.rpc("get_organization_detail_by_name", {
    p_name: trimmedName,
  });

  if (error) {
    logError("ORGS_RPC_DETAIL_ERROR", {
      name: trimmedName,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const detail = mapOrganizationDetail((data as OrganizationDetailRpc) ?? null);

  if (!detail) {
    logWarn("ORGS_RPC_DETAIL_NOT_FOUND", {
      name: trimmedName,
      status,
      statusText,
    });
    return null;
  }

  logInfo("ORGS_RPC_DETAIL_RESULT", {
    name: trimmedName,
    status,
    statusText,
    resolvedName: detail.name,
  });

  return enrichOrganizationPublishedRows(detail);
});

export const getDefaultOrganizationDetail = cache(async (): Promise<OrganizationDetail | null> => {
  logInfo("ORGS_RPC_DEFAULT_DETAIL_START", {});

  const { data, error, status, statusText } = await supabase.rpc("get_default_organization_detail");

  if (error) {
    logError("ORGS_RPC_DEFAULT_DETAIL_ERROR", {
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const detail = mapOrganizationDetail((data as OrganizationDetailRpc) ?? null);

  if (!detail) {
    logWarn("ORGS_RPC_DEFAULT_DETAIL_EMPTY", {
      status,
      statusText,
    });
    return null;
  }

  logInfo("ORGS_RPC_DEFAULT_DETAIL_RESULT", {
    status,
    statusText,
    resolvedName: detail.name,
  });

  return enrichOrganizationPublishedRows(detail);
});
