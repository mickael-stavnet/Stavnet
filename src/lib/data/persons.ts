import { cacheData } from "@/lib/data/cache";
import { supabase } from "@/lib/supabase";
import { fixEncoding } from "@/lib/encoding";
import { resolvePersonImageSrc } from "@/lib/person-images";
import { logError, logInfo, logWarn } from "@/lib/server-log";

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
};

type PersonDetailRpc = {
  name?: unknown;
  alternateName?: unknown;
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

type PersonSourceRow = Record<string, unknown>;
type PersonBookSourceRow = Record<string, unknown>;

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
  };
}

function readSourceField(row: PersonSourceRow, candidates: string[]): string {
  for (const candidate of candidates) {
    if (candidate in row) {
      return readText(row[candidate]);
    }
  }

  return "";
}

function mapSourceBibliographyRow(row: PersonSourceRow): PersonBibliographyRow {
  return {
    type: readSourceField(row, ["Type Contribution", "Type Contribution. 1", "Type Contribution 1"]),
    language: readSourceField(row, ["Langue Traduction", "Langue Traduite", "Langue de Traduction"]),
    title: readSourceField(row, ["Titre"]),
    year: readSourceField(row, ["Année Publication", "Annee Publication"]),
    issue: readSourceField(row, ["Cote Livre", "Côte Livre"]),
  };
}

function joinName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter((value) => value.length > 0).join(" ");
}

async function fetchAllTableRows(table: "data-person" | "data-books", select: string, batchSize = 1000): Promise<Record<string, unknown>[]> {
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

function mergeBibliographyRows(rows: PersonBibliographyRow[]): PersonBibliographyRow[] {
  const byKey = new Map<string, PersonBibliographyRow>();

  for (const row of rows) {
    if (!Object.values(row).some((value) => value.length > 0)) {
      continue;
    }

    const key = [row.type, row.language, row.title, row.year]
      .map((value) => normalizePersonValue(value))
      .join("|");
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, row);
      continue;
    }

    const nextRow = {
      type: current.type || row.type,
      language: current.language || row.language,
      title: current.title || row.title,
      year: current.year || row.year,
      issue: current.issue || row.issue,
    };

    byKey.set(key, nextRow);
  }

  return Array.from(byKey.values());
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
    imageSrc: resolvePersonImageSrc(name, alternateName),
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
    stats: {
      cardsFound: readCount(detail.stats?.cardsFound),
      databaseContains: readCount(detail.stats?.databaseContains),
    },
  };
}

async function fetchPersonBibliographyRows(name: string, alternateName: string, writingLanguage: string): Promise<PersonBibliographyRow[]> {
  const normalizedNames = [name, alternateName]
    .map((value) => normalizePersonValue(value))
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

  if (normalizedNames.length === 0) {
    return [];
  }

  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "bibliography-scan-start",
    name,
    alternateName: alternateName || null,
    writingLanguage: writingLanguage || null,
  });

  const [personData, bookData] = await Promise.all([
    fetchAllTableRows("data-person", "*"),
    fetchAllTableRows(
      "data-books",
      'id,"Titre","Langue","Année","Auteur. 1. Prénom","Auteur. 1. Nom","Auteur. 2. Prénom","Auteur. 2. Nom","Auteur. 3. Prénom","Auteur. 3. Nom"',
    ),
  ]);

  const personRows = personData
    .filter((row) => {
      const sourceRow = row as PersonSourceRow;
      const primaryName = readSourceField(sourceRow, ["Prénom Nom", "Prenom Nom"]);
      const alternatePersonName = readSourceField(sourceRow, ["Nom Prénom", "Nom Prenom"]);
      const originalAuthor = readSourceField(sourceRow, ["Auteur Original"]);

      return [primaryName, alternatePersonName, originalAuthor].some((value) => normalizedNames.includes(normalizePersonValue(value)));
    })
    .map((row) => mapSourceBibliographyRow(row as PersonSourceRow));

  const bookRows = bookData
    .filter((row) => {
      const sourceRow = row as PersonBookSourceRow;
      const authorNames = [
        joinName(readSourceField(sourceRow, ["Auteur. 1. Prénom"]), readSourceField(sourceRow, ["Auteur. 1. Nom"])),
        joinName(readSourceField(sourceRow, ["Auteur. 2. Prénom"]), readSourceField(sourceRow, ["Auteur. 2. Nom"])),
        joinName(readSourceField(sourceRow, ["Auteur. 3. Prénom"]), readSourceField(sourceRow, ["Auteur. 3. Nom"])),
      ];

      return authorNames.some((value) => normalizedNames.includes(normalizePersonValue(value)));
    })
    .map((row) => {
      const sourceRow = row as PersonBookSourceRow;

      return {
        type: normalizePersonValue(readSourceField(sourceRow, ["Langue"])) === normalizePersonValue(writingLanguage) ? "Original" : "Traduction",
        language: readSourceField(sourceRow, ["Langue"]),
        title: readSourceField(sourceRow, ["Titre"]),
        year: readSourceField(sourceRow, ["Année"]),
        issue: "",
      };
    });

  const mergedRows = mergeBibliographyRows([...personRows, ...bookRows]);

  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "bibliography-scan-result",
    name,
    alternateName: alternateName || null,
    writingLanguage: writingLanguage || null,
    personRows: personRows.length,
    bookRows: bookRows.length,
    mergedRows: mergedRows.length,
  });

  return mergedRows;
}

async function enrichPersonDetailBibliography(detail: PersonDetail): Promise<PersonDetail> {
  const bibliographyRows = await fetchPersonBibliographyRows(detail.name, detail.alternateName, detail.language);

  if (bibliographyRows.length <= detail.bibliographyRows.length) {
    logInfo("DEBUG_LOG_INFINITE_FETCH", {
      route: "/persons/details",
      phase: "bibliography-no-enrichment",
      name: detail.name,
      existingRows: detail.bibliographyRows.length,
      candidateRows: bibliographyRows.length,
    });
    return detail;
  }

  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/persons/details",
    phase: "bibliography-enriched",
    name: detail.name,
    existingRows: detail.bibliographyRows.length,
    candidateRows: bibliographyRows.length,
  });

  return {
    ...detail,
    bibliographyRows,
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
): Promise<PersonPageRpc> {
  const currentPage = Math.max(1, page);
  const trimmedSearchTerm = searchTerm?.trim() ?? "";

  logInfo("PERSONS_RPC_PAGE_START", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
  });

  const { data, error, status, statusText } = await supabase.rpc("get_persons_page", {
    p_page: currentPage,
    p_page_size: pageSize,
    p_search: trimmedSearchTerm.length > 0 ? trimmedSearchTerm : null,
  });

  if (error) {
    logError("PERSONS_RPC_PAGE_ERROR", {
      page: currentPage,
      pageSize,
      searchTerm: trimmedSearchTerm || null,
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

export const getPersonDetailByName = cacheData(
  ["persons-detail-by-name"],
  async (name: string): Promise<PersonDetail | null> => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      logWarn("PERSONS_RPC_DETAIL_EMPTY_NAME", { rawName: name });
      return null;
    }

    logInfo("PERSONS_RPC_DETAIL_START", {
      name: trimmedName,
    });

    const { data, error, status, statusText } = await supabase.rpc("get_person_detail_by_name", {
      p_name: trimmedName,
    });

    if (error) {
      logError("PERSONS_RPC_DETAIL_ERROR", {
        name: trimmedName,
        status,
        statusText,
        error,
      });
      throw new Error(error.message);
    }

    const detail = mapPersonDetail((data as PersonDetailRpc) ?? null);

    if (!detail) {
      logWarn("PERSONS_RPC_DETAIL_NOT_FOUND", {
        name: trimmedName,
        status,
        statusText,
      });
      return null;
    }

    logInfo("PERSONS_RPC_DETAIL_RESULT", {
      name: trimmedName,
      status,
      statusText,
      resolvedName: detail.name,
    });

    return enrichPersonDetailBibliography(detail);
  },
  { revalidate: 300, tags: ["persons"] },
);

export const getDefaultPersonDetail = cacheData(
  ["persons-default-detail"],
  async (): Promise<PersonDetail | null> => {
    logInfo("PERSONS_RPC_DEFAULT_DETAIL_START", {});

    const { data, error, status, statusText } = await supabase.rpc("get_default_person_detail");

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

    return enrichPersonDetailBibliography(detail);
  },
  { revalidate: 300, tags: ["persons"] },
);
