import { cache } from "react";
import { resolveBookCoverSrc } from "@/lib/book-images";
import { fixEncoding } from "@/lib/encoding";
import { logError, logInfo, logWarn } from "@/lib/server-log";
import { supabase } from "@/lib/supabase";

export const BOOKS_PAGE_SIZE = 13;

const BOOK_LIST_SELECT = [
  "id",
  '"Titre"',
  '"Auteur. 1. Nom"',
  '"Auteur. 1. Prénom"',
  '"Éditeur"',
  '"Éditeur. 1. Nom"',
  '"Langue"',
  '"Année"',
  '"Année. Pages. Dimensions"',
].join(",");

const BOOK_DETAIL_SELECT = [
  "id",
  '"Titre"',
  '"Titre. Anglais"',
  '"Titre. Original"',
  '"Titre. Transcription"',
  '"Sous-titre"',
  '"Sous-titre. Anglais"',
  '"Sous-titre. Original"',
  '"Sous-titre. Transcription"',
  '"Langue"',
  '"Année"',
  '"Nb. Pages"',
  '"Dimensions"',
  '"Reliure"',
  '"Prix. €"',
  '"Prix. $"',
  '"Prix. Public"',
  '"Année. Pages. Dimensions"',
  '"ISBN"',
  '"Éditeur"',
  '"Pays. Éditeur"',
  '"Éditeur. 1. Collection"',
  '"Éditeur. 1. ISBN"',
  '"Éditeur. 1. Nom"',
  '"Éditeur. 1. Pays"',
  '"Éditeur. 1. Ville"',
  '"Éditeur. 2. Nom"',
  '"Éditeur. 2. Pays"',
  '"Genre"',
  '"Genre. 1"',
  '"Genre. 2"',
  '"Rubrique"',
  '"Catégorie. 1"',
  '"Catégorie. 2"',
  '"Thème. 1"',
  '"Thème. 2"',
  '"Résumé"',
  '"Sommaire"',
  '"Quatrième. Couverture"',
  '"Auteur. 1. Langue"',
  '"Auteur. 1. Nom"',
  '"Auteur. 1. Prénom"',
  '"Auteur. 1. Type"',
  '"Auteur. 2. Langue"',
  '"Auteur. 2. Nom"',
  '"Auteur. 2. Prénom"',
  '"Auteur. 2. Type"',
  '"Auteur. 3. Langue"',
  '"Auteur. 3. Nom"',
  '"Auteur. 3. Prénom"',
  '"Auteur. 3. Type"',
  '"Contrib. 1. Genre/Langue"',
  '"Contrib. 1. Langue Traduite"',
  '"Contrib. 1. Nom"',
  '"Contrib. 1. Prénom"',
  '"Contrib. 2. Genre/Langue"',
  '"Contrib. 2. Langue Traduite"',
  '"Contrib. 2. Nom"',
  '"Contrib. 2. Prénom"',
  '"Contrib. 3. Genre/Langue"',
  '"Contrib. 3. Langue Traduite"',
  '"Contrib. 3. Nom"',
  '"Contrib. 3. Prénom"',
  '"Contrib. 4. Genre/Langue"',
  '"Contrib. 4. Langue Traduite"',
  '"Contrib. 4. Nom"',
  '"Contrib. 4. Prénom"',
  '"Contrib. 5. Genre/Langue"',
  '"Contrib. 5. Langue Traduite"',
  '"Contrib. 5. Nom"',
  '"Contrib. 5. Prénom"',
  '"Contrib. 6. Genre/Langue"',
  '"Contrib. 6. Langue Traduite"',
  '"Contrib. 6. Nom"',
  '"Contrib. 6. Prénom"',
  '"Contrib. 7. Genre/Langue"',
  '"Contrib. 7. Nom"',
  '"Contrib. 7. Prénom"',
  '"Contrib. 8. Genre/Langue"',
  '"Contrib. 8. Langue Traduite"',
  '"Contrib. 8. Nom"',
  '"Contrib. 8. Prénom"',
  '"Contrib. 9. Genre/Langue"',
  '"Contrib. 9. Langue Traduite"',
  '"Contrib. 9. Nom"',
  '"Contrib. 9. Prénom"',
  '"Contrib. 10. Genre/Langue"',
  '"Contrib. 10. Langue Traduite"',
  '"Contrib. 10. Nom"',
  '"Contrib. 10. Prénom"',
].join(",");

type BookRow = Record<string, unknown> & {
  id?: unknown;
};

export interface BookListItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  language: string;
  year: string;
  publication: string;
  issue: string;
  edition: string;
}

export interface BookAuthorRow {
  name: string;
  type: string;
  language: string;
}

export interface BookContributorRow {
  name: string;
  type: string;
  language: string;
}

export interface BookPublisherRow {
  name: string;
  country: string;
  isbn: string;
}

export interface BookDetail {
  id: string;
  imageSrc: string;
  title: string;
  titleEnglish: string;
  titleOriginal: string;
  titleTranscription: string;
  subtitle: string;
  subtitleEnglish: string;
  subtitleOriginal: string;
  subtitleTranscription: string;
  language: string;
  summary: string;
  tableOfContents: string;
  backCover: string;
  yearPages: string;
  authors: BookAuthorRow[];
  contributors: BookContributorRow[];
  publishers: BookPublisherRow[];
  category: string[];
  subject: string[];
  genre: string[];
  targetAudience: string[];
  stats: {
    cardsFound: string;
    databaseContains: string;
  };
}

export interface BookListResult {
  items: BookListItem[];
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

  const text = fixEncoding(String(value)).trim();
  return text.toUpperCase() === "NULL" ? "" : text;
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

function readId(value: unknown): string {
  const parsed = readNumber(value);
  return parsed > 0 ? String(parsed) : "";
}

function readList(values: unknown[]): string[] {
  return values
    .map(readText)
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
}

function joinName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter((value) => value.length > 0).join(" ");
}

function parsePublicationCode(value: string): {
  publication: string;
  issue: string;
  edition: string;
} {
  const parts = value.split("-").map((part) => part.trim()).filter((part) => part.length > 0);

  return {
    publication: parts[1] ?? "",
    edition: parts[3] ?? "",
    issue: parts[4] ?? "",
  };
}

function buildYearPages(row: BookRow): string {
  const values = [
    readText(row["Année"]),
    readText(row["Nb. Pages"]) ? `${readText(row["Nb. Pages"])} p.` : "",
    readText(row["Dimensions"]),
    readText(row["Reliure"]),
    readText(row["Prix. Public"]),
    readText(row["Prix. €"]) ? `${readText(row["Prix. €"])} €` : "",
    readText(row["Prix. $"]) ? `${readText(row["Prix. $"])} $` : "",
  ].filter((value) => value.length > 0);

  return values.join(", ");
}

function buildAuthors(row: BookRow): BookAuthorRow[] {
  const authors: BookAuthorRow[] = [];

  for (const index of [1, 2, 3]) {
    const name = joinName(
      readText(row[`Auteur. ${index}. Prénom`]),
      readText(row[`Auteur. ${index}. Nom`]),
    );
    const type = readText(row[`Auteur. ${index}. Type`]);
    const language = readText(row[`Auteur. ${index}. Langue`]);

    if (!name && !type && !language) {
      continue;
    }

    authors.push({
      name,
      type,
      language,
    });
  }

  return authors;
}

function buildContributors(row: BookRow): BookContributorRow[] {
  const contributors: BookContributorRow[] = [];

  for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const name = joinName(
      readText(row[`Contrib. ${index}. Prénom`]),
      readText(row[`Contrib. ${index}. Nom`]),
    );
    const type = readText(row[`Contrib. ${index}. Genre/Langue`]);
    const language = index === 7 ? "" : readText(row[`Contrib. ${index}. Langue Traduite`]);

    if (!name && !type && !language) {
      continue;
    }

    contributors.push({
      name,
      type,
      language,
    });
  }

  return contributors;
}

function buildPublishers(row: BookRow): BookPublisherRow[] {
  const publishers: BookPublisherRow[] = [];

  const primaryName = readText(row["Éditeur. 1. Nom"]) || readText(row["Éditeur"]);
  const primaryCountry = readText(row["Éditeur. 1. Pays"]) || readText(row["Pays. Éditeur"]);
  const primaryIsbn = readText(row["Éditeur. 1. ISBN"]) || readText(row["ISBN"]);

  if (primaryName || primaryCountry || primaryIsbn) {
    publishers.push({
      name: primaryName,
      country: primaryCountry,
      isbn: primaryIsbn,
    });
  }

  const secondaryName = readText(row["Éditeur. 2. Nom"]);
  const secondaryCountry = readText(row["Éditeur. 2. Pays"]);

  if (secondaryName || secondaryCountry) {
    publishers.push({
      name: secondaryName,
      country: secondaryCountry,
      isbn: "",
    });
  }

  return publishers;
}

function mapBookListItem(row: BookRow): BookListItem {
  const code = parsePublicationCode(readText(row["Année. Pages. Dimensions"]));

  return {
    id: readId(row.id),
    title: readText(row["Titre"]),
    author: joinName(readText(row["Auteur. 1. Nom"]), readText(row["Auteur. 1. Prénom"])),
    publisher: readText(row["Éditeur. 1. Nom"]) || readText(row["Éditeur"]),
    language: readText(row["Langue"]),
    year: readText(row["Année"]),
    publication: code.publication,
    issue: code.issue,
    edition: code.edition,
  };
}

const getBooksDatabaseTotals = cache(async (): Promise<{ cardsFound: number; databaseContains: number }> => {
  const [validResult, databaseResult] = await Promise.all([
    supabase.from("data-books").select("id", { count: "exact", head: true }).not("Titre", "is", null).neq("Titre", "").neq("Titre", "NULL"),
    supabase.from("data-books").select("id", { count: "exact", head: true }),
  ]);

  if (validResult.error) {
    throw new Error(validResult.error.message);
  }

  if (databaseResult.error) {
    throw new Error(databaseResult.error.message);
  }

  return {
    cardsFound: validResult.count ?? 0,
    databaseContains: databaseResult.count ?? 0,
  };
});

function mapBookDetail(row: BookRow, totals: { cardsFound: number; databaseContains: number }): BookDetail | null {
  const id = readId(row.id);
  const title = readText(row["Titre"]);

  if (!id || !title) {
    return null;
  }

  const titleEnglish = readText(row["Titre. Anglais"]);
  const titleOriginal = readText(row["Titre. Original"]);
  const titleTranscription = readText(row["Titre. Transcription"]);

  return {
    id,
    imageSrc: resolveBookCoverSrc(title, titleEnglish, titleOriginal),
    title,
    titleEnglish,
    titleOriginal,
    titleTranscription,
    subtitle: readText(row["Sous-titre"]),
    subtitleEnglish: readText(row["Sous-titre. Anglais"]),
    subtitleOriginal: readText(row["Sous-titre. Original"]),
    subtitleTranscription: readText(row["Sous-titre. Transcription"]),
    language: readText(row["Langue"]),
    summary: readText(row["Résumé"]),
    tableOfContents: readText(row["Sommaire"]),
    backCover: readText(row["Quatrième. Couverture"]),
    yearPages: buildYearPages(row),
    authors: buildAuthors(row),
    contributors: buildContributors(row),
    publishers: buildPublishers(row),
    category: readList([row["Catégorie. 1"], row["Catégorie. 2"]]),
    subject: readList([row["Thème. 1"], row["Thème. 2"]]),
    genre: readList([row["Genre"], row["Genre. 1"], row["Genre. 2"]]),
    targetAudience: readList([row["Rubrique"]]),
    stats: {
      cardsFound: String(totals.cardsFound),
      databaseContains: String(totals.databaseContains),
    },
  };
}

async function fetchBooksPagePayload(page: number, pageSize: number, searchTerm?: string): Promise<{
  rows: BookRow[];
  total: number;
}> {
  const currentPage = Math.max(1, page);
  const trimmedSearchTerm = searchTerm?.trim() ?? "";

  logInfo("BOOKS_PAGE_START", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
  });

  let query = supabase
    .from("data-books")
    .select(BOOK_LIST_SELECT, { count: "exact" })
    .not("Titre", "is", null)
    .neq("Titre", "")
    .neq("Titre", "NULL");

  if (trimmedSearchTerm) {
    query = query.ilike("Titre", `%${trimmedSearchTerm}%`);
  }

  const { data, error, count, status, statusText } = await query
    .order("Titre", { ascending: true })
    .order("id", { ascending: true })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    logError("BOOKS_PAGE_ERROR", {
      page: currentPage,
      pageSize,
      searchTerm: trimmedSearchTerm || null,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  logInfo("BOOKS_PAGE_RESULT", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    status,
    statusText,
    itemCount: Array.isArray(data) ? data.length : 0,
    totalCount: count ?? 0,
  });

  return {
    rows: Array.isArray(data) ? (data as unknown as BookRow[]) : [],
    total: count ?? 0,
  };
}

function buildBookListResult(rows: BookRow[], total: number, currentPage: number, pageSize: number, databaseTotal: number): BookListResult {
  return {
    items: rows.map(mapBookListItem).filter((item) => item.id.length > 0 && item.title.length > 0),
    page: currentPage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    databaseTotal,
  };
}

export async function getBooksPage(page: number, pageSize = BOOKS_PAGE_SIZE): Promise<BookListResult> {
  const currentPage = Math.max(1, page);
  const [{ rows, total }, totals] = await Promise.all([
    fetchBooksPagePayload(currentPage, pageSize),
    getBooksDatabaseTotals(),
  ]);

  return buildBookListResult(rows, total, currentPage, pageSize, totals.databaseContains);
}

export async function getBooksPageByTitle(page: number, searchTerm: string, pageSize = BOOKS_PAGE_SIZE): Promise<BookListResult> {
  const currentPage = Math.max(1, page);
  const [{ rows, total }, totals] = await Promise.all([
    fetchBooksPagePayload(currentPage, pageSize, searchTerm),
    getBooksDatabaseTotals(),
  ]);

  return buildBookListResult(rows, total, currentPage, pageSize, totals.databaseContains);
}

export const getBookDetailById = cache(async (id: string): Promise<BookDetail | null> => {
  const trimmedId = id.trim();

  if (!trimmedId) {
    logWarn("BOOK_DETAIL_EMPTY_ID", { rawId: id });
    return null;
  }

  logInfo("BOOK_DETAIL_START", {
    id: trimmedId,
  });

  const [rowResult, totals] = await Promise.all([
    supabase
      .from("data-books")
      .select(BOOK_DETAIL_SELECT)
      .eq("id", trimmedId)
      .maybeSingle(),
    getBooksDatabaseTotals(),
  ]);

  const { data, error, status, statusText } = rowResult;

  if (error) {
    logError("BOOK_DETAIL_ERROR", {
      id: trimmedId,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const detail = mapBookDetail((data as BookRow | null) ?? {}, totals);

  if (!detail) {
    logWarn("BOOK_DETAIL_NOT_FOUND", {
      id: trimmedId,
      status,
      statusText,
    });
    return null;
  }

  logInfo("BOOK_DETAIL_RESULT", {
    id: trimmedId,
    status,
    statusText,
    resolvedTitle: detail.title,
  });

  return detail;
});

export const getDefaultBookDetail = cache(async (): Promise<BookDetail | null> => {
  logInfo("BOOK_DEFAULT_DETAIL_START", {});

  const [rowResult, totals] = await Promise.all([
    supabase
      .from("data-books")
      .select(BOOK_DETAIL_SELECT)
      .not("Titre", "is", null)
      .neq("Titre", "")
      .neq("Titre", "NULL")
      .order("Titre", { ascending: true })
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle(),
    getBooksDatabaseTotals(),
  ]);

  const { data, error, status, statusText } = rowResult;

  if (error) {
    logError("BOOK_DEFAULT_DETAIL_ERROR", {
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const detail = mapBookDetail((data as BookRow | null) ?? {}, totals);

  if (!detail) {
    logWarn("BOOK_DEFAULT_DETAIL_EMPTY", {
      status,
      statusText,
    });
    return null;
  }

  logInfo("BOOK_DEFAULT_DETAIL_RESULT", {
    status,
    statusText,
    resolvedTitle: detail.title,
  });

  return detail;
});
