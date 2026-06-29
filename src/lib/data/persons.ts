import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { fixEncoding } from "@/lib/encoding";
import { resolvePersonImageSrc } from "@/lib/person-images";
import { logError, logInfo, logWarn } from "@/lib/server-log";

const PERSONS_TABLE = "data-person";
const PERSON_NAME_COLUMN = "Pr�nom Nom";
const PERSON_ALT_NAME_COLUMN = "Nom Pr�nom";
const PERSON_WRITING_LANGUAGE_COLUMN = "Langue �criture";
const PERSON_ACTIVITY_COLUMN = "Activit� Professionnelle";
const PERSON_DEATH_DATE_COLUMN = "Date de D�c�s";
const PERSON_DEATH_PLACE_COLUMN = "Lieu de D�c�s";
const PERSON_RESIDENCE_COLUMN = "Pays de R�sidence";
const PERSON_PUBLICATION_YEAR_COLUMN = "Ann�e Publication";
const PERSON_POCKET_REISSUES_COLUMN = "Nb. R��ditions Poche";
const PERSON_REGULAR_REISSUES_COLUMN = "Nb. R��ditions R�guli�res";

export const PERSONS_PAGE_SIZE = 13;

type DatabaseRow = Record<string, string | number | null>;

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

const compareByLocaleName = (left: string, right: string): number =>
  left.localeCompare(right, "fr", { sensitivity: "base", ignorePunctuation: true });

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

function readValue(row: DatabaseRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim().length > 0) {
      return fixEncoding(value).trim();
    }
  }
  return "";
}

function readCount(row: DatabaseRow, keys: string[]): string {
  const value = readValue(row, keys);
  return value || "0";
}

function composeParts(parts: string[]): string {
  const filtered = parts.filter((part) => part.length > 0);
  return filtered.join(", ");
}

function isDisplayablePersonName(value: string): boolean {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return false;
  }
  return !/^[?\s-]+$/.test(trimmedValue);
}

function mapPersonListItem(row: DatabaseRow): PersonListItem {
  return {
    name: readValue(row, [PERSON_NAME_COLUMN, PERSON_ALT_NAME_COLUMN]),
    type: readValue(row, ["Type Personne"]),
    language: readValue(row, [PERSON_WRITING_LANGUAGE_COLUMN]),
    originalTitles: readCount(row, ["Nb. Titres Originaux"]),
    translatedTitles: readCount(row, ["Nb. Titres Traduits"]),
    translationLanguages: readCount(row, ["Nb. Langues Traduction"]),
    awards: readCount(row, ["Nb. Prix Distinctions"]),
    regularReissues: readCount(row, [PERSON_REGULAR_REISSUES_COLUMN]),
    pocketReissues: readCount(row, [PERSON_POCKET_REISSUES_COLUMN]),
    publicationCountries: readCount(row, ["Nb. Pays Publication"]),
  };
}

function mapPersonDetail(row: DatabaseRow, filteredTotal: number, databaseTotal: number): PersonDetail {
  const bibliographyRow: PersonBibliographyRow = {
    type: readValue(row, ["Type Contribution"]),
    language: readValue(row, ["Langue Traduction"]),
    title: readValue(row, ["Titre"]),
    year: readValue(row, [PERSON_PUBLICATION_YEAR_COLUMN]),
    issue: readValue(row, ["Cote Livre"]),
  };
  const bibliographyRows =
    Object.values(bibliographyRow).some((value) => value.length > 0) ? [bibliographyRow] : [];

  return {
    name: readValue(row, [PERSON_NAME_COLUMN, PERSON_ALT_NAME_COLUMN]),
    alternateName: readValue(row, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
    imageSrc: resolvePersonImageSrc(
      readValue(row, [PERSON_NAME_COLUMN, PERSON_ALT_NAME_COLUMN]),
      readValue(row, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
    ),
    type: readValue(row, ["Type Personne"]),
    language: readValue(row, [PERSON_WRITING_LANGUAGE_COLUMN]),
    birthInfo: composeParts([
      readValue(row, ["Ville de Naissance"]),
      readValue(row, ["Date de Naissance"]),
    ]),
    deathInfo: composeParts([
      readValue(row, [PERSON_DEATH_PLACE_COLUMN]),
      readValue(row, [PERSON_DEATH_DATE_COLUMN]),
    ]),
    residence: readValue(row, [PERSON_RESIDENCE_COLUMN]),
    professionalActivity: readValue(row, [PERSON_ACTIVITY_COLUMN]),
    biography: readValue(row, ["Biographie"]),
    bibliographyStats: {
      originalTitles: readCount(row, ["Nb. Titres Originaux"]),
      translations: readCount(row, ["Nb. Titres Traduits"]),
      publicationLanguages: readCount(row, ["Nb. Langues Traduction"]),
    },
    bibliographyRows,
    stats: {
      cardsFound: String(filteredTotal),
      databaseContains: String(databaseTotal),
    },
  };
}

function hasPersonIdentity(row: DatabaseRow): boolean {
  return isDisplayablePersonName(readValue(row, [PERSON_NAME_COLUMN, PERSON_ALT_NAME_COLUMN]));
}

const getAllPersonsRows = cache(async (): Promise<DatabaseRow[]> => {
  logInfo("PERSONS_DB_ALL_ROWS_START", {
    table: PERSONS_TABLE,
    strategy: "plain_select_then_local_sort_and_filter",
  });
  const { data, error, status, statusText } = await supabase
    .from(PERSONS_TABLE)
    .select("*")
    .range(0, 5000);

  if (error) {
    logError("PERSONS_DB_ALL_ROWS_ERROR", {
      table: PERSONS_TABLE,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as DatabaseRow[]).filter(hasPersonIdentity);
  logInfo("PERSONS_DB_ALL_ROWS_RAW", {
    table: PERSONS_TABLE,
    status,
    statusText,
    rowCount: rows.length,
    sampleRow: rows[0] ?? null,
  });
  return rows;
});

const getPersonsDatabaseTotal = cache(async (): Promise<number> => {
  logInfo("PERSONS_DB_TOTAL_START", {
    table: PERSONS_TABLE,
    strategy: "exact_count_head",
  });
  const { count, error, status, statusText } = await supabase
    .from(PERSONS_TABLE)
    .select("*", { count: "exact", head: true });

  if (error) {
    logError("PERSONS_DB_TOTAL_ERROR", {
      table: PERSONS_TABLE,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const total = count ?? 0;
  logInfo("PERSONS_DB_TOTAL_RESULT", {
    table: PERSONS_TABLE,
    status,
    statusText,
    total,
  });
  return total;
});

export async function getPersonsPage(page: number, pageSize = PERSONS_PAGE_SIZE): Promise<PersonListResult> {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  logInfo("PERSONS_DB_PAGE_START", {
    table: PERSONS_TABLE,
    page: currentPage,
    pageSize,
    range: { from, to },
    orderBy: "local:name",
  });

  const [rows, databaseTotal] = await Promise.all([getAllPersonsRows(), getPersonsDatabaseTotal()]);
  const sortedRows = rows.slice().sort((left, right) =>
    compareByLocaleName(
      readValue(left, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
      readValue(right, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
    ),
  );
  const pagedRows = sortedRows.slice(from, to + 1);
  const total = sortedRows.length;
  logInfo("PERSONS_DB_PAGE_LOCAL_RESULT", {
    table: PERSONS_TABLE,
    strategy: "local_sort_and_slice",
    totalRows: rows.length,
    pageRowCount: pagedRows.length,
    sampleRow: pagedRows[0] ?? null,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: pagedRows.map(mapPersonListItem),
    page: currentPage,
    pageSize,
    total,
    totalPages,
    databaseTotal,
  };
}

export async function getPersonsPageByName(
  page: number,
  searchTerm: string,
  pageSize = PERSONS_PAGE_SIZE,
): Promise<PersonListResult> {
  const currentPage = Math.max(1, page);
  const normalizedSearchTerm = normalizeSearchValue(searchTerm);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  logInfo("PERSONS_DB_SEARCH_PAGE_START", {
    table: PERSONS_TABLE,
    page: currentPage,
    pageSize,
    range: { from, to },
    searchTerm,
    normalizedSearchTerm,
  });

  const [rows, databaseTotal] = await Promise.all([getAllPersonsRows(), getPersonsDatabaseTotal()]);
  const filteredRows = rows.filter((row) => {
    const primaryName = normalizeSearchValue(readValue(row, [PERSON_NAME_COLUMN, PERSON_ALT_NAME_COLUMN]));
    const alternateName = normalizeSearchValue(readValue(row, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]));
    return primaryName.includes(normalizedSearchTerm) || alternateName.includes(normalizedSearchTerm);
  });
  const sortedRows = filteredRows.slice().sort((left, right) =>
    compareByLocaleName(
      readValue(left, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
      readValue(right, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
    ),
  );
  const pagedRows = sortedRows.slice(from, to + 1);
  const total = sortedRows.length;
  logInfo("PERSONS_DB_SEARCH_PAGE_RESULT", {
    table: PERSONS_TABLE,
    searchTerm,
    normalizedSearchTerm,
    filteredRows: filteredRows.length,
    pageRowCount: pagedRows.length,
    sampleRow: pagedRows[0] ?? null,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: pagedRows.map(mapPersonListItem),
    page: currentPage,
    pageSize,
    total,
    totalPages,
    databaseTotal,
  };
}

export const getPersonDetailByName = cache(async (name: string): Promise<PersonDetail | null> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    logWarn("PERSONS_DB_DETAIL_EMPTY_NAME", { rawName: name });
    return null;
  }
  logInfo("PERSONS_DB_DETAIL_START", {
    table: PERSONS_TABLE,
    filter: {
      column: "local:name",
      value: trimmedName,
    },
  });

  const [rows, databaseTotal] = await Promise.all([getAllPersonsRows(), getPersonsDatabaseTotal()]);
  const data =
    rows.find((row) => readValue(row, [PERSON_NAME_COLUMN, PERSON_ALT_NAME_COLUMN]) === trimmedName) ??
    rows.find((row) => readValue(row, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]) === trimmedName) ??
    null;

  if (!data) {
    logWarn("PERSONS_DB_DETAIL_NOT_FOUND", {
      table: PERSONS_TABLE,
      filter: {
        column: "local:name",
        value: trimmedName,
      },
      totalRows: rows.length,
    });
    return null;
  }

  logInfo("PERSONS_DB_DETAIL_RAW", {
    table: PERSONS_TABLE,
    strategy: "local_lookup",
    row: data,
  });
  return mapPersonDetail(data as DatabaseRow, rows.length, databaseTotal);
});

export const getDefaultPersonDetail = cache(async (): Promise<PersonDetail | null> => {
  logInfo("PERSONS_DB_DEFAULT_DETAIL_START", {
    table: PERSONS_TABLE,
    orderBy: "local:name",
  });
  const [rows, databaseTotal] = await Promise.all([getAllPersonsRows(), getPersonsDatabaseTotal()]);
  const data =
    rows
      .slice()
      .sort((left, right) =>
        compareByLocaleName(
          readValue(left, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
          readValue(right, [PERSON_ALT_NAME_COLUMN, PERSON_NAME_COLUMN]),
        ),
      )[0] ?? null;

  if (!data) {
    logWarn("PERSONS_DB_DEFAULT_DETAIL_EMPTY", {
      table: PERSONS_TABLE,
      totalRows: rows.length,
    });
    return null;
  }

  logInfo("PERSONS_DB_DEFAULT_DETAIL_RAW", {
    table: PERSONS_TABLE,
    strategy: "local_sort_pick_first",
    row: data,
  });
  return mapPersonDetail(data as DatabaseRow, rows.length, databaseTotal);
});
