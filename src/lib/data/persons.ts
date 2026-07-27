import { cacheData } from "@/lib/data/cache";
import { d1Client } from "@/lib/d1-client";
import { fixEncoding } from "@/lib/encoding";
import { resolvePersonImageSrc } from "@/lib/person-images";
import { logError, logInfo, logWarn } from "@/lib/server-log";
import { buildDetailStatistics, type DetailStatistics } from "@/lib/detail-statistics";

export const PERSONS_PAGE_SIZE = 13;

type PersonPageItemRpc = {
  name?: unknown;
  type?: unknown;
  language?: unknown;
  originalTitles?: unknown;
  translatedTitles?: unknown;
  translationLanguages?: unknown;
  awards?: unknown;
  regularReissues?: unknown;
  pocketReissues?: unknown;
  publicationCountries?: unknown;
};

type PersonBibliographyRowRpc = {
  type?: unknown;
  language?: unknown;
  title?: unknown;
  year?: unknown;
  issue?: unknown;
  country?: unknown;
  role?: unknown;
};

type PersonDetailRpc = {
  name?: unknown;
  alternateName?: unknown;
  imageSrc?: unknown;
  type?: unknown;
  language?: unknown;
  birthInfo?: unknown;
  deathInfo?: unknown;
  residence?: unknown;
  professionalActivity?: unknown;
  biography?: unknown;
  bibliographyStats?: {
    originalTitles?: unknown;
    translations?: unknown;
    publicationLanguages?: unknown;
  } | null;
  bibliographyRows?: PersonBibliographyRowRpc[] | null;
  stats?: {
    cardsFound?: unknown;
    databaseContains?: unknown;
  } | null;
} | null;

type PersonPageRpc = {
  items?: PersonPageItemRpc[] | null;
  totalCount?: unknown;
  databaseTotal?: unknown;
} | null;

export interface PersonListItem {
  name: string;
  type: string;
  language: string;
  originalTitles: string;
  translatedTitles: string;
  translationLanguages: string;
  awards: string;
  regularReissues: string;
  pocketReissues: string;
  publicationCountries: string;
}

export interface PersonBibliographyRow {
  type: string;
  language: string;
  title: string;
  year: string;
  issue: string;
  country?: string;
  role?: string;
}

export interface PersonDetail {
  name: string;
  alternateName: string;
  imageSrc: string;
  type: string;
  language: string;
  birthInfo: string;
  deathInfo: string;
  residence: string;
  professionalActivity: string;
  biography: string;
  bibliographyStats: {
    originalTitles: string;
    translations: string;
    publicationLanguages: string;
  };
  bibliographyRows: PersonBibliographyRow[];
  statistics: DetailStatistics;
  stats: {
    cardsFound: string;
    databaseContains: string;
  };
}

export interface PersonListResult {
  items: PersonListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  databaseTotal: number;
}

type PersonDetailResolutionOutcome =
  | "empty-name"
  | "direct-match"
  | "variant-match"
  | "fallback-candidate-match"
  | "not-found";

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

function normalizePersonValue(value: string): string {
  return readText(value).toLocaleLowerCase();
}

function normalizeLoosePersonValue(value: string): string {
  return readText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`´-]/g, " ")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

function buildPersonNameCandidates(value: string): string[] {
  const trimmedValue = readText(value);
  if (!trimmedValue) {
    return [];
  }

  const words = trimmedValue.split(/\s+/).filter(Boolean);
  const reversedValue = words.length > 1 ? words.slice().reverse().join(" ") : "";
  const rotatedValue = words.length > 1 ? [...words.slice(1), words[0]].join(" ") : "";
  const hyphenatedRotatedValue = words.length > 2 ? `${words.slice(1).join("-")} ${words[0]}` : "";
  const candidates = [trimmedValue, reversedValue, rotatedValue, hyphenatedRotatedValue].filter(Boolean);

  return candidates.filter((candidate, index) => candidates.indexOf(candidate) === index);
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

function mapPersonListItem(item: PersonPageItemRpc): PersonListItem {
  return {
    name: readText(item.name),
    type: readText(item.type),
    language: readText(item.language),
    originalTitles: readCount(item.originalTitles),
    translatedTitles: readCount(item.translatedTitles),
    translationLanguages: readCount(item.translationLanguages),
    awards: readCount(item.awards),
    regularReissues: readCount(item.regularReissues),
    pocketReissues: readCount(item.pocketReissues),
    publicationCountries: readCount(item.publicationCountries),
  };
}

function mapBibliographyRow(row: PersonBibliographyRowRpc): PersonBibliographyRow {
  return {
    type: readText(row.type),
    language: readText(row.language),
    title: readText(row.title),
    year: readText(row.year),
    issue: readText(row.issue),
    country: readText(row.country),
    role: readText(row.role),
  };
}

function mapPersonDetail(detail: PersonDetailRpc): PersonDetail | null {
  if (!detail) {
    return null;
  }

  const name = readText(detail.name);
  const alternateName = readText(detail.alternateName);
  const bibliographyRows = Array.isArray(detail.bibliographyRows)
    ? detail.bibliographyRows.map(mapBibliographyRow).filter((row) =>
        Object.values(row).some((value) => value.length > 0),
      )
    : [];

  return {
    name,
    alternateName,
    imageSrc: readText(detail.imageSrc) || resolvePersonImageSrc(name, alternateName),
    type: readText(detail.type),
    language: readText(detail.language),
    birthInfo: readText(detail.birthInfo),
    deathInfo: readText(detail.deathInfo),
    residence: readText(detail.residence),
    professionalActivity: readText(detail.professionalActivity),
    biography: readText(detail.biography),
    bibliographyStats: {
      originalTitles: readCount(detail.bibliographyStats?.originalTitles),
      translations: readCount(detail.bibliographyStats?.translations),
      publicationLanguages: readCount(detail.bibliographyStats?.publicationLanguages),
    },
    bibliographyRows,
    statistics: buildDetailStatistics(bibliographyRows.map((item) => ({ year: item.year, primary: item.type.toLocaleLowerCase().includes("orig"), language: item.language, country: item.country, role: item.role || item.type }))),
    stats: {
      cardsFound: readCount(detail.stats?.cardsFound),
      databaseContains: readCount(detail.stats?.databaseContains),
    },
  };
}

async function enrichPersonDetailBibliography(detail: PersonDetail): Promise<PersonDetail> {
  return detail;
}

async function findFallbackPersonNameCandidates(name: string): Promise<string[]> {
  void name;
  return [];
}

async function fetchPersonDetailRpcByName(name: string): Promise<{
  detail: PersonDetail | null;
  status: number;
  statusText: string;
}> {
  const { data, error, status, statusText } = await d1Client.rpc("get_person_detail_by_name", {
    p_name: name,
  });

  if (error) {
    logError("PERSONS_RPC_DETAIL_ERROR", {
      name,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  return {
    detail: mapPersonDetail((data as PersonDetailRpc) ?? null),
    status,
    statusText,
  };
}

function buildPersonListResult(
  payload: PersonPageRpc,
  currentPage: number,
  pageSize: number,
): PersonListResult {
  const items = Array.isArray(payload?.items) ? payload.items.map(mapPersonListItem) : [];
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

async function fetchPersonsPagePayload(
  page: number,
  pageSize: number,
  searchTerm?: string,
  type?: string,
  language?: string,
): Promise<PersonPageRpc> {
  const currentPage = Math.max(1, page);
  const trimmedSearchTerm = searchTerm?.trim() ?? "";
  const trimmedType = type?.trim() ?? "";
  const trimmedLanguage = language?.trim() ?? "";

  logInfo("PERSONS_RPC_PAGE_START", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    type: trimmedType || null,
    language: trimmedLanguage || null,
  });

  const { data, error, status, statusText } = await d1Client.rpc("get_persons_page", {
    p_page: currentPage,
    p_page_size: pageSize,
    p_search: trimmedSearchTerm.length > 0 ? trimmedSearchTerm : null,
    p_type: trimmedType || null,
    p_language: trimmedLanguage || null,
  });

  if (error) {
    logError("PERSONS_RPC_PAGE_ERROR", {
      page: currentPage,
      pageSize,
      searchTerm: trimmedSearchTerm || null,
      type: trimmedType || null,
      language: trimmedLanguage || null,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  logInfo("PERSONS_RPC_PAGE_RESULT", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    type: trimmedType || null,
    language: trimmedLanguage || null,
    status,
    statusText,
    itemCount: Array.isArray((data as PersonPageRpc)?.items) ? (data as PersonPageRpc)?.items?.length ?? 0 : 0,
    totalCount: readNumber((data as PersonPageRpc)?.totalCount),
    databaseTotal: readNumber((data as PersonPageRpc)?.databaseTotal),
  });

  return (data as PersonPageRpc) ?? null;
}

export const getPersonsPage = cacheData(
  ["persons-page"],
  async (page: number, pageSize: number = PERSONS_PAGE_SIZE): Promise<PersonListResult> => {
    const currentPage = Math.max(1, page);
    const payload = await fetchPersonsPagePayload(currentPage, pageSize);
    return buildPersonListResult(payload, currentPage, pageSize);
  },
  { revalidate: 60, tags: ["persons"] },
);

export const getPersonsPageByName = cacheData(
  ["persons-page-by-name"],
  async (page: number, searchTerm: string, pageSize: number = PERSONS_PAGE_SIZE): Promise<PersonListResult> => {
    const currentPage = Math.max(1, page);
    const payload = await fetchPersonsPagePayload(currentPage, pageSize, searchTerm);
    return buildPersonListResult(payload, currentPage, pageSize);
  },
  { revalidate: 60, tags: ["persons"] },
);

export const getPersonsPageByFilters = cacheData(
  ["persons-page-by-filters"],
  async (
    page: number,
    filters: { searchTerm?: string; type?: string; language?: string },
    pageSize: number = PERSONS_PAGE_SIZE,
  ): Promise<PersonListResult> => {
    const currentPage = Math.max(1, page);
    const payload = await fetchPersonsPagePayload(currentPage, pageSize, filters.searchTerm, filters.type, filters.language);
    return buildPersonListResult(payload, currentPage, pageSize);
  },
  { revalidate: 60, tags: ["persons"] },
);

export const getPersonDetailByName = cacheData(
  ["persons-detail-by-name-v6-bibliography-calculated-stats"],
  async (name: string): Promise<PersonDetail | null> => {
    const trimmedName = name.trim();
    const normalizedName = normalizePersonValue(trimmedName);
    const normalizedLooseName = normalizeLoosePersonValue(trimmedName);

    if (!trimmedName) {
      logWarn("PERSONS_RPC_DETAIL_DECISION", {
        outcome: "empty-name" satisfies PersonDetailResolutionOutcome,
        rawName: name,
      });
      return null;
    }

    const candidates = buildPersonNameCandidates(trimmedName);

    logInfo("PERSONS_RPC_DETAIL_START", {
      name: trimmedName,
      normalizedName,
      normalizedLooseName,
      candidates,
    });

    for (const candidate of candidates) {
      const { detail, status, statusText } = await fetchPersonDetailRpcByName(candidate);

      if (!detail) {
        logInfo("PERSONS_RPC_DETAIL_CANDIDATE_MISS", {
          name: trimmedName,
          candidate,
          status,
          statusText,
        });
        continue;
      }

      const outcome: PersonDetailResolutionOutcome = candidate === trimmedName ? "direct-match" : "variant-match";

      logInfo("PERSONS_RPC_DETAIL_DECISION", {
        outcome,
        name: trimmedName,
        candidate,
        status,
        statusText,
        resolvedName: detail.name,
      });

      return enrichPersonDetailBibliography(detail);
    }

    const fallbackCandidates = await findFallbackPersonNameCandidates(trimmedName);

    for (const candidate of fallbackCandidates) {
      if (candidates.includes(candidate)) {
        continue;
      }

      const { detail, status, statusText } = await fetchPersonDetailRpcByName(candidate);

      if (!detail) {
        logInfo("PERSONS_RPC_DETAIL_FALLBACK_CANDIDATE_MISS", {
          name: trimmedName,
          candidate,
          status,
          statusText,
        });
        continue;
      }

      logInfo("PERSONS_RPC_DETAIL_DECISION", {
        outcome: "fallback-candidate-match" satisfies PersonDetailResolutionOutcome,
        name: trimmedName,
        candidate,
        status,
        statusText,
        resolvedName: detail.name,
      });

      return enrichPersonDetailBibliography(detail);
    }

    logWarn("PERSONS_RPC_DETAIL_DECISION", {
      outcome: "not-found" satisfies PersonDetailResolutionOutcome,
      name: trimmedName,
      normalizedName,
      normalizedLooseName,
      candidates,
      fallbackCandidates,
    });
    return null;
  },
  { revalidate: 1, tags: ["persons"] },
);

export const getDefaultPersonDetail = cacheData(
  ["persons-default-detail-v3"],
  async (): Promise<PersonDetail | null> => {
    logInfo("PERSONS_RPC_DEFAULT_DETAIL_START", {});

    const { data, error, status, statusText } = await d1Client.rpc("get_default_person_detail");

    if (error) {
      logError("PERSONS_RPC_DEFAULT_DETAIL_ERROR", {
        status,
        statusText,
        error,
      });
      throw new Error(error.message);
    }

    const detail = mapPersonDetail((data as PersonDetailRpc) ?? null);

    if (!detail) {
      logWarn("PERSONS_RPC_DEFAULT_DETAIL_EMPTY", {
        status,
        statusText,
      });
      return null;
    }

    logInfo("PERSONS_RPC_DEFAULT_DETAIL_RESULT", {
      status,
      statusText,
      resolvedName: detail.name,
    });

    return detail;
  },
  { revalidate: 300, tags: ["persons"] },
);
