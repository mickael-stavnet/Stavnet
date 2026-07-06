import { cache } from "react";
import { resolveBookCoverSrc } from "@/lib/book-images";
import type { BookRelatedFacet } from "@/lib/book-related";
import { fixEncoding } from "@/lib/encoding";
import { logError, logInfo, logWarn } from "@/lib/server-log";
import { supabase } from "@/lib/supabase";

export const BOOKS_PAGE_SIZE = 13;

const BOOK_LIST_SELECT = [
  "id",
  '"Titre"',
  '"Titre. Anglais"',
  '"Titre. Original"',
  '"Titre. Transcription"',
  '"Sous-titre"',
  '"Auteur. 1. Nom"',
  '"Auteur. 1. Prénom"',
  '"Auteur. 1. Langue"',
  '"Auteur. 2. Nom"',
  '"Auteur. 2. Prénom"',
  '"Auteur. 2. Langue"',
  '"Auteur. 3. Nom"',
  '"Auteur. 3. Prénom"',
  '"Auteur. 3. Langue"',
  '"Contrib. 1. Nom"',
  '"Contrib. 1. Prénom"',
  '"Contrib. 2. Nom"',
  '"Contrib. 2. Prénom"',
  '"Contrib. 3. Nom"',
  '"Contrib. 3. Prénom"',
  '"Contrib. 4. Nom"',
  '"Contrib. 4. Prénom"',
  '"Contrib. 5. Nom"',
  '"Contrib. 5. Prénom"',
  '"Contrib. 6. Nom"',
  '"Contrib. 6. Prénom"',
  '"Contrib. 7. Nom"',
  '"Contrib. 7. Prénom"',
  '"Contrib. 8. Nom"',
  '"Contrib. 8. Prénom"',
  '"Contrib. 9. Nom"',
  '"Contrib. 9. Prénom"',
  '"Contrib. 10. Nom"',
  '"Contrib. 10. Prénom"',
  '"Éditeur"',
  '"Éditeur. 1. Nom"',
  '"Éditeur. 2. Nom"',
  '"Langue"',
  '"Année"',
  '"Année. Pages. Dimensions"',
  '"Thème. 1"',
  '"Thème. 2"',
  '"Résumé"',
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
  '"Biblio. 1. Cote"',
  '"Biblio. 1. Nom"',
  '"Biblio. 1. Source"',
  '"Biblio. 1. Type"',
  '"Biblio. 1. Ville"',
  '"Biblio. 2. Cote"',
  '"Biblio. 2. Nom"',
  '"Biblio. 2. Source"',
  '"Biblio. 2. Type"',
  '"Biblio. 2. Ville"',
  '"Biblio. 3. Cote"',
  '"Biblio. 3. Nom"',
  '"Biblio. 3. Source"',
  '"Biblio. 3. Type"',
  '"Biblio. 3. Ville"',
  '"Biblio. 4. Cote"',
  '"Biblio. 4. Nom"',
  '"Biblio. 4. Source"',
  '"Biblio. 4. Type"',
  '"Biblio. 4. Ville"',
].join(",");

const BOOK_PUBLISHING_SELECT = [
  "id",
  '"Titre"',
  '"Titre. Anglais"',
  '"Titre. Original"',
  '"Titre. Transcription"',
  '"Langue"',
  '"Année"',
  '"Catégorie. 1"',
  '"Éditeur"',
  '"Éditeur. 1. Nom"',
].join(",");

const BOOK_RELATED_FALLBACK_SELECT = [
  "id",
  '"Titre"',
  '"Auteur. 1. Nom"',
  '"Auteur. 1. Prénom"',
  '"Auteur. 1. Type"',
  '"Auteur. 1. Langue"',
  '"Auteur. 2. Nom"',
  '"Auteur. 2. Prénom"',
  '"Auteur. 2. Type"',
  '"Auteur. 2. Langue"',
  '"Auteur. 3. Nom"',
  '"Auteur. 3. Prénom"',
  '"Auteur. 3. Type"',
  '"Auteur. 3. Langue"',
  '"Contrib. 1. Nom"',
  '"Contrib. 1. Prénom"',
  '"Contrib. 1. Genre/Langue"',
  '"Contrib. 1. Langue Traduite"',
  '"Contrib. 2. Nom"',
  '"Contrib. 2. Prénom"',
  '"Contrib. 2. Genre/Langue"',
  '"Contrib. 2. Langue Traduite"',
  '"Contrib. 3. Nom"',
  '"Contrib. 3. Prénom"',
  '"Contrib. 3. Genre/Langue"',
  '"Contrib. 3. Langue Traduite"',
  '"Contrib. 4. Nom"',
  '"Contrib. 4. Prénom"',
  '"Contrib. 4. Genre/Langue"',
  '"Contrib. 4. Langue Traduite"',
  '"Contrib. 5. Nom"',
  '"Contrib. 5. Prénom"',
  '"Contrib. 5. Genre/Langue"',
  '"Contrib. 5. Langue Traduite"',
  '"Contrib. 6. Nom"',
  '"Contrib. 6. Prénom"',
  '"Contrib. 6. Genre/Langue"',
  '"Contrib. 6. Langue Traduite"',
  '"Contrib. 7. Nom"',
  '"Contrib. 7. Prénom"',
  '"Contrib. 7. Genre/Langue"',
  '"Contrib. 8. Nom"',
  '"Contrib. 8. Prénom"',
  '"Contrib. 8. Genre/Langue"',
  '"Contrib. 8. Langue Traduite"',
  '"Contrib. 9. Nom"',
  '"Contrib. 9. Prénom"',
  '"Contrib. 9. Genre/Langue"',
  '"Contrib. 9. Langue Traduite"',
  '"Contrib. 10. Nom"',
  '"Contrib. 10. Prénom"',
  '"Contrib. 10. Genre/Langue"',
  '"Contrib. 10. Langue Traduite"',
  '"Éditeur"',
  '"Éditeur. 1. Nom"',
  '"Éditeur. 1. Pays"',
  '"Éditeur. 2. Nom"',
  '"Éditeur. 2. Pays"',
  '"Pays. Éditeur"',
  '"Langue"',
  '"Année"',
  '"Année. Pages. Dimensions"',
  '"Catégorie. 1"',
  '"Catégorie. 2"',
  '"Thème. 1"',
  '"Thème. 2"',
  '"Genre"',
  '"Genre. 1"',
  '"Genre. 2"',
  '"Rubrique"',
].join(",");

type BookRow = Record<string, unknown> & {
  id?: unknown;
};

type BookRelatedPageItemRpc = {
  id?: unknown;
  title?: unknown;
  author?: unknown;
  publisher?: unknown;
  language?: unknown;
  year?: unknown;
  publicationCode?: unknown;
};

type BookRelatedPageRpc = {
  items?: BookRelatedPageItemRpc[] | null;
  totalCount?: unknown;
  databaseTotal?: unknown;
} | null;

export interface BookListItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  language: string;
  writingLanguage: string;
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

export interface BookAvailabilityRow {
  org: string;
  type: string;
  shelfmark: string;
  city: string;
  country: string;
  source: string;
}

export interface BookPublishingRow {
  status: string;
  language: string;
  title: string;
  publisher: string;
  year: string;
  edition: string;
  publication: string;
}

export interface BookPublishingStat {
  count: string;
  label: "languages" | "original" | "translated";
}

export interface BookPressReviewRow {
  authorName: string;
  sourceName: string;
  sourceDate: string;
  excerpt: string;
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
  availability: BookAvailabilityRow[];
  publishing: BookPublishingRow[];
  publishingStats: BookPublishingStat[];
  pressReviews: BookPressReviewRow[];
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

export type BookTitleResolutionResult =
  | { kind: "unique"; id: string }
  | { kind: "none" }
  | { kind: "multiple" };

export interface BookSearchFilters {
  title: string;
  personLastName: string;
  personFirstName: string;
  organization: string;
  theme: string;
  publicationLanguage: string;
  year: string;
  generalSearch: string;
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

function isBookReferenceCode(value: string): boolean {
  return /^\d{5}-[A-Z]-L\d{2}-[A-Z]-E\d{2}$/i.test(value.trim());
}

function normalizeBookFacetValue(value: string): string {
  return readText(value).toLocaleLowerCase();
}

function normalizeBookSearchFilters(filters?: Partial<BookSearchFilters>): BookSearchFilters {
  return {
    title: filters?.title?.trim() ?? "",
    personLastName: filters?.personLastName?.trim() ?? "",
    personFirstName: filters?.personFirstName?.trim() ?? "",
    organization: filters?.organization?.trim() ?? "",
    theme: filters?.theme?.trim() ?? "",
    publicationLanguage: filters?.publicationLanguage?.trim() ?? "",
    year: filters?.year?.trim() ?? "",
    generalSearch: filters?.generalSearch?.trim() ?? "",
  };
}

function hasBookSearchFilters(filters: BookSearchFilters): boolean {
  return Object.values(filters).some((value) => value.length > 0);
}

function readBookYearSortValue(value: unknown): number {
  const text = readText(value);
  const match = text.match(/\d{4}/);

  if (!match) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
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

function parseBookReferenceCode(value: string): {
  status: string;
  edition: string;
  publication: string;
} {
  const parts = value.split("-").map((part) => part.trim()).filter((part) => part.length > 0);

  return {
    status: parts[1] ?? "",
    edition: parts[3] ?? "",
    publication: parts[4] ?? "",
  };
}

function buildWorkSignature(row: BookRow): string[] {
  return [
    readText(row["Titre. Original"]),
    readText(row["Titre. Anglais"]),
    readText(row["Titre. Transcription"]),
    readText(row["Titre"]),
  ].filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
}

function matchesBookSearchValue(values: string[], query: string): boolean {
  const normalizedQuery = normalizeBookFacetValue(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => normalizeBookFacetValue(value).includes(normalizedQuery));
}

function buildBookSearchPeople(row: BookRow): Array<{ firstName: string; lastName: string; fullName: string }> {
  const people: Array<{ firstName: string; lastName: string; fullName: string }> = [];

  for (const index of [1, 2, 3]) {
    const firstName = readText(row[`Auteur. ${index}. Prénom`]);
    const lastName = readText(row[`Auteur. ${index}. Nom`]);
    const fullName = joinName(firstName, lastName);

    if (firstName || lastName) {
      people.push({ firstName, lastName, fullName });
    }
  }

  for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const firstName = readText(row[`Contrib. ${index}. Prénom`]);
    const lastName = readText(row[`Contrib. ${index}. Nom`]);
    const fullName = joinName(firstName, lastName);

    if (firstName || lastName) {
      people.push({ firstName, lastName, fullName });
    }
  }

  return people;
}

function matchesBookSearch(row: BookRow, searchTerm: string, filters: BookSearchFilters): boolean {
  if (
    searchTerm &&
    !matchesBookSearchValue(
      [
        readText(row["Titre"]),
        readText(row["Sous-titre"]),
        readText(row["Titre. Anglais"]),
        readText(row["Titre. Original"]),
        readText(row["Titre. Transcription"]),
      ],
      searchTerm,
    )
  ) {
    return false;
  }

  if (
    filters.title &&
    !matchesBookSearchValue(
      [
        readText(row["Titre"]),
        readText(row["Sous-titre"]),
        readText(row["Titre. Anglais"]),
        readText(row["Titre. Original"]),
        readText(row["Titre. Transcription"]),
      ],
      filters.title,
    )
  ) {
    return false;
  }

  if (filters.organization && !matchesBookSearchValue([readText(row["Éditeur"]), readText(row["Éditeur. 1. Nom"]), readText(row["Éditeur. 2. Nom"])], filters.organization)) {
    return false;
  }

  if (filters.theme && !matchesBookSearchValue([readText(row["Thème. 1"]), readText(row["Thème. 2"])], filters.theme)) {
    return false;
  }

  if (filters.publicationLanguage && !matchesBookSearchValue([readText(row["Langue"])], filters.publicationLanguage)) {
    return false;
  }

  if (filters.year) {
    const normalizedYear = normalizeBookFacetValue(filters.year);
    const rowYear = normalizeBookFacetValue(readText(row["Année"]));

    if (!rowYear || rowYear !== normalizedYear) {
      return false;
    }
  }

  if (filters.personLastName || filters.personFirstName) {
    const normalizedLastName = normalizeBookFacetValue(filters.personLastName);
    const normalizedFirstName = normalizeBookFacetValue(filters.personFirstName);
    const people = buildBookSearchPeople(row);
    const hasMatchingPerson = people.some((person) => {
      const firstNameMatches = !normalizedFirstName || normalizeBookFacetValue(person.firstName).includes(normalizedFirstName);
      const lastNameMatches = !normalizedLastName || normalizeBookFacetValue(person.lastName).includes(normalizedLastName);
      return firstNameMatches && lastNameMatches;
    });

    if (!hasMatchingPerson) {
      return false;
    }
  }

  if (
    filters.generalSearch &&
    !matchesBookSearchValue(
      [
        readText(row["Titre"]),
        readText(row["Sous-titre"]),
        readText(row["Titre. Anglais"]),
        readText(row["Titre. Original"]),
        readText(row["Titre. Transcription"]),
        readText(row["Résumé"]),
        readText(row["Thème. 1"]),
        readText(row["Thème. 2"]),
        readText(row["Langue"]),
        readText(row["Éditeur"]),
        readText(row["Éditeur. 1. Nom"]),
        readText(row["Éditeur. 2. Nom"]),
        ...buildBookSearchPeople(row).map((person) => person.fullName),
      ],
      filters.generalSearch,
    )
  ) {
    return false;
  }

  return true;
}

function matchesBookRelatedFacet(row: BookRow, facet: BookRelatedFacet, normalizedValue: string): boolean {
  if (!normalizedValue) {
    return false;
  }

  switch (facet) {
    case "authorName":
      return buildAuthors(row).some((author) => normalizeBookFacetValue(author.name) === normalizedValue);
    case "translationLanguage":
      return normalizeBookFacetValue(readText(row["Langue"])) === normalizedValue;
    case "authorType":
      return buildAuthors(row).some((author) => normalizeBookFacetValue(author.type) === normalizedValue);
    case "authorWritingLanguage":
      return buildAuthors(row).some((author) => normalizeBookFacetValue(author.language) === normalizedValue);
    case "contributorName":
      return buildContributors(row).some((contributor) => normalizeBookFacetValue(contributor.name) === normalizedValue);
    case "contributorType":
      return buildContributors(row).some((contributor) => normalizeBookFacetValue(contributor.type) === normalizedValue);
    case "contributorLanguage":
      return buildContributors(row).some((contributor) => normalizeBookFacetValue(contributor.language) === normalizedValue);
    case "publisherName":
      return buildPublishers(row).some((publisher) => normalizeBookFacetValue(publisher.name) === normalizedValue);
    case "publisherCountry":
      return buildPublishers(row).some((publisher) => normalizeBookFacetValue(publisher.country) === normalizedValue);
    case "category":
      return readList([row["Catégorie. 1"], row["Catégorie. 2"]])
        .filter((value) => !isBookReferenceCode(value))
        .some((value) => normalizeBookFacetValue(value) === normalizedValue);
    case "subject":
      return readList([row["Thème. 1"], row["Thème. 2"]]).some((value) => normalizeBookFacetValue(value) === normalizedValue);
    case "genre":
      return readList([row["Genre"], row["Genre. 1"], row["Genre. 2"]]).some((value) => normalizeBookFacetValue(value) === normalizedValue);
    case "targetAudience":
      return normalizeBookFacetValue(readText(row["Rubrique"])) === normalizedValue;
    default:
      return false;
  }
}

const getOrganizationCountryMap = cache(async (): Promise<Map<string, string>> => {
  const { data, error } = await supabase.from("data-organism").select('"Organisme","Pays"');

  if (error) {
    throw new Error(error.message);
  }

  const countryMap = new Map<string, string>();

  for (const row of (data as BookRow[] | null) ?? []) {
    const name = readText(row["Organisme"]);
    const country = readText(row["Pays"]);

    if (name && country && !countryMap.has(name)) {
      countryMap.set(name, country);
    }
  }

  return countryMap;
});

function buildAvailabilityRows(row: BookRow, organizationCountryMap: Map<string, string>): BookAvailabilityRow[] {
  const availability: BookAvailabilityRow[] = [];

  for (const index of [1, 2, 3, 4]) {
    const org = readText(row[`Biblio. ${index}. Nom`]);
    const type = readText(row[`Biblio. ${index}. Type`]);
    const shelfmark = readText(row[`Biblio. ${index}. Cote`]);
    const city = readText(row[`Biblio. ${index}. Ville`]);
    const source = readText(row[`Biblio. ${index}. Source`]);
    const country = org ? organizationCountryMap.get(org) ?? "" : "";

    if (!org && !type && !shelfmark && !city && !source && !country) {
      continue;
    }

    availability.push({
      org,
      type,
      shelfmark,
      city,
      country,
      source,
    });
  }

  return availability;
}

function buildPublishingRows(rows: BookRow[]): BookPublishingRow[] {
  return rows
    .map((row) => {
      const code = parseBookReferenceCode(readText(row["Catégorie. 1"]));
      const status = code.status || (readText(row["Titre. Original"]) ? "O" : "T");
      const title =
        status === "O"
          ? readText(row["Titre. Original"]) || readText(row["Titre"])
          : readText(row["Titre"]) || readText(row["Titre. Original"]);

      return {
        status,
        language: readText(row["Langue"]),
        title,
        publisher: readText(row["Éditeur. 1. Nom"]) || readText(row["Éditeur"]),
        year: readText(row["Année"]),
        edition: code.edition,
        publication: code.publication,
      };
    })
    .filter((row) => Object.values(row).some((value) => value.length > 0))
    .sort((left, right) => {
      const leftYear = Number.parseInt(left.year, 10);
      const rightYear = Number.parseInt(right.year, 10);

      if (Number.isFinite(leftYear) && Number.isFinite(rightYear) && leftYear !== rightYear) {
        return leftYear - rightYear;
      }

      return left.language.localeCompare(right.language, "fr");
    });
}

function buildPublishingStats(rows: BookPublishingRow[]): BookPublishingStat[] {
  const languageCount = new Set(rows.map((row) => row.language).filter((value) => value.length > 0)).size;
  const originalCount = rows.filter((row) => row.status === "O").length;
  const translatedCount = rows.filter((row) => row.status === "T").length;

  return [
    { count: String(languageCount), label: "languages" },
    { count: String(originalCount), label: "original" },
    { count: String(translatedCount), label: "translated" },
  ];
}

async function getBookPressReviews(bookId: string): Promise<BookPressReviewRow[]> {
  const { data, error } = await supabase
    .from("book_press_reviews")
    .select("id,author_name,source_name,source_date,excerpt,position")
    .eq("book_id", bookId)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    const message = error.message ?? "Unknown error";

    if (
      message.includes("book_press_reviews") &&
      (
        message.includes("does not exist") ||
        message.includes("schema cache") ||
        message.includes("Could not find the table")
      )
    ) {
      logWarn("BOOK_PRESS_REVIEWS_UNAVAILABLE", {
        bookId,
        message,
      });
      return [];
    }

    throw new Error(message);
  }

  return ((data as BookRow[] | null) ?? [])
    .map((row) => ({
      authorName: readText(row.author_name),
      sourceName: readText(row.source_name),
      sourceDate: readText(row.source_date),
      excerpt: readText(row.excerpt),
    }))
    .filter((row) => row.excerpt.length > 0);
}

function mapBookListItem(row: BookRow): BookListItem {
  const code = parsePublicationCode(readText(row["Année. Pages. Dimensions"]));

  return {
    id: readId(row.id),
    title: readText(row["Titre"]),
    author: joinName(readText(row["Auteur. 1. Nom"]), readText(row["Auteur. 1. Prénom"])),
    publisher: readText(row["Éditeur. 1. Nom"]) || readText(row["Éditeur"]),
    language: readText(row["Langue"]),
    writingLanguage: readText(row["Auteur. 1. Langue"]) || readText(row["Auteur. 2. Langue"]) || readText(row["Auteur. 3. Langue"]),
    year: readText(row["Année"]),
    publication: code.publication,
    issue: code.issue,
    edition: code.edition,
  };
}

function mapBookRelatedPageItem(item: BookRelatedPageItemRpc): BookListItem {
  const code = parsePublicationCode(readText(item.publicationCode));

  return {
    id: readId(item.id),
    title: readText(item.title),
    author: readText(item.author),
    publisher: readText(item.publisher),
    language: readText(item.language),
    writingLanguage: "",
    year: readText(item.year),
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

function mapBookDetail(
  row: BookRow,
  totals: { cardsFound: number; databaseContains: number },
  availability: BookAvailabilityRow[],
  publishing: BookPublishingRow[],
  pressReviews: BookPressReviewRow[],
): BookDetail | null {
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
    availability,
    publishing,
    publishingStats: buildPublishingStats(publishing),
    pressReviews,
    category: readList([row["Catégorie. 1"], row["Catégorie. 2"]]).filter((value) => !isBookReferenceCode(value)),
    subject: readList([row["Thème. 1"], row["Thème. 2"]]),
    genre: readList([row["Genre"], row["Genre. 1"], row["Genre. 2"]]),
    targetAudience: readList([row["Rubrique"]]),
    stats: {
      cardsFound: String(totals.cardsFound),
      databaseContains: String(totals.databaseContains),
    },
  };
}

async function getPublishingRows(row: BookRow): Promise<BookPublishingRow[]> {
  const signatures = buildWorkSignature(row);
  const originalTitle = readText(row["Titre. Original"]);
  const englishTitle = readText(row["Titre. Anglais"]);
  const transcriptionTitle = readText(row["Titre. Transcription"]);
  const title = readText(row["Titre"]);

  let query = supabase.from("data-books").select(BOOK_PUBLISHING_SELECT);

  if (originalTitle) {
    query = query.filter('"Titre. Original"', "eq", originalTitle);
  } else if (englishTitle) {
    query = query.filter('"Titre. Anglais"', "eq", englishTitle);
  } else if (transcriptionTitle) {
    query = query.filter('"Titre. Transcription"', "eq", transcriptionTitle);
  } else {
    query = query.filter('"Titre"', "eq", title);
  }

  const { data, error } = await query.order('"Année"', { ascending: true }).order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const relatedRows = ((data as unknown as BookRow[] | null) ?? []).filter((relatedRow) => {
    const relatedSignatures = buildWorkSignature(relatedRow);
    return signatures.some((signature) => relatedSignatures.includes(signature));
  });

  return buildPublishingRows(relatedRows.length > 0 ? relatedRows : [row]);
}

async function fetchBooksPagePayload(page: number, pageSize: number, searchTerm?: string, rawFilters?: Partial<BookSearchFilters>): Promise<{
  rows: BookRow[];
  total: number;
}> {
  const currentPage = Math.max(1, page);
  const trimmedSearchTerm = searchTerm?.trim() ?? "";
  const filters = normalizeBookSearchFilters(rawFilters);
  const batchSize = 1000;
  const rows: BookRow[] = [];
  let from = 0;

  logInfo("BOOKS_PAGE_START", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    filters: hasBookSearchFilters(filters) ? filters : null,
  });

  const query = supabase
    .from("data-books")
    .select(BOOK_LIST_SELECT, { count: "exact" })
    .not("Titre", "is", null)
    .neq("Titre", "")
    .neq("Titre", "NULL");

  while (true) {
    const { data, error, status, statusText } = await query.range(from, from + batchSize - 1);

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

    const batch = Array.isArray(data) ? (data as unknown as BookRow[]) : [];
    rows.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  rows.sort((left, right) => {
    const yearDiff = readBookYearSortValue(right["Année"]) - readBookYearSortValue(left["Année"]);

    if (yearDiff !== 0) {
      return yearDiff;
    }

    const leftTitle = readText(left["Titre"]);
    const rightTitle = readText(right["Titre"]);
    const titleDiff = leftTitle.localeCompare(rightTitle, "fr", { sensitivity: "base" });

    if (titleDiff !== 0) {
      return titleDiff;
    }

    const leftId = readId(left.id);
    const rightId = readId(right.id);
    return leftId.localeCompare(rightId, "en", { numeric: true, sensitivity: "base" });
  });

  const filteredRows = rows.filter((row) => matchesBookSearch(row, trimmedSearchTerm, filters));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  logInfo("BOOKS_PAGE_RESULT", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    filters: hasBookSearchFilters(filters) ? filters : null,
    rowCount: rows.length,
    filteredCount: filteredRows.length,
    itemCount: pagedRows.length,
    totalCount: filteredRows.length,
  });

  return {
    rows: pagedRows,
    total: filteredRows.length,
  };
}

async function fetchBooksPageByFacetFallback(
  page: number,
  facet: BookRelatedFacet,
  value: string,
  pageSize: number,
): Promise<BookListResult> {
  const currentPage = Math.max(1, page);
  const normalizedValue = normalizeBookFacetValue(value);
  const batchSize = 1000;
  const rows: BookRow[] = [];
  let from = 0;

  logWarn("BOOKS_RELATED_PAGE_RPC_FALLBACK_START", {
    page: currentPage,
    pageSize,
    facet,
    value: value || null,
  });

  while (true) {
    const { data, error, status, statusText } = await supabase
      .from("data-books")
      .select(BOOK_RELATED_FALLBACK_SELECT)
      .not("Titre", "is", null)
      .neq("Titre", "")
      .neq("Titre", "NULL")
      .order("Titre", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      logError("BOOKS_RELATED_PAGE_RPC_FALLBACK_ERROR", {
        page: currentPage,
        pageSize,
        facet,
        value: value || null,
        status,
        statusText,
        error,
      });
      throw new Error(error.message);
    }

    const batch = Array.isArray(data) ? (data as unknown as BookRow[]) : [];
    rows.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  const filteredRows = rows.filter((row) => matchesBookRelatedFacet(row, facet, normalizedValue));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totals = await getBooksDatabaseTotals();

  logWarn("BOOKS_RELATED_PAGE_RPC_FALLBACK_RESULT", {
    page: currentPage,
    pageSize,
    facet,
    value: value || null,
    totalRows: rows.length,
    filteredRows: filteredRows.length,
    pageRows: pagedRows.length,
  });

  return buildBookListResult(pagedRows, filteredRows.length, currentPage, pageSize, totals.databaseContains);
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

export async function getBooksPageByAdvancedSearch(
  page: number,
  filters: Partial<BookSearchFilters>,
  pageSize = BOOKS_PAGE_SIZE,
): Promise<BookListResult> {
  const currentPage = Math.max(1, page);
  const [{ rows, total }, totals] = await Promise.all([
    fetchBooksPagePayload(currentPage, pageSize, "", filters),
    getBooksDatabaseTotals(),
  ]);

  return buildBookListResult(rows, total, currentPage, pageSize, totals.databaseContains);
}

export async function getBooksPageByFacet(
  page: number,
  facet: BookRelatedFacet,
  value: string,
  pageSize = BOOKS_PAGE_SIZE,
): Promise<BookListResult> {
  const currentPage = Math.max(1, page);
  const trimmedValue = value.trim();

  logInfo("BOOKS_RPC_RELATED_PAGE_START", {
    page: currentPage,
    pageSize,
    facet,
    value: trimmedValue || null,
  });

  const { data, error, status, statusText } = await supabase.rpc("get_books_page_by_facet", {
    p_page: currentPage,
    p_page_size: pageSize,
    p_facet: facet,
    p_value: trimmedValue,
  });

  if (error) {
    if (error.message.includes("Could not find the function public.get_books_page_by_facet")) {
      return fetchBooksPageByFacetFallback(currentPage, facet, trimmedValue, pageSize);
    }

    logError("BOOKS_RPC_RELATED_PAGE_ERROR", {
      page: currentPage,
      pageSize,
      facet,
      value: trimmedValue || null,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const payload = (data as BookRelatedPageRpc) ?? null;
  const items = Array.isArray(payload?.items) ? payload.items.map(mapBookRelatedPageItem) : [];
  const total = readNumber(payload?.totalCount);
  const databaseTotal = readNumber(payload?.databaseTotal);

  logInfo("BOOKS_RPC_RELATED_PAGE_RESULT", {
    page: currentPage,
    pageSize,
    facet,
    value: trimmedValue || null,
    status,
    statusText,
    itemCount: items.length,
    totalCount: total,
    databaseTotal,
  });

  return {
    items: items.filter((item) => item.id.length > 0 && item.title.length > 0),
    page: currentPage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    databaseTotal,
  };
}

export const resolveBookByExactTitle = cache(async (title: string): Promise<BookTitleResolutionResult> => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { kind: "none" };
  }

  const normalizedTitle = normalizeBookFacetValue(trimmedTitle);
  const { data, error, status, statusText } = await supabase
    .from("data-books")
    .select('id,"Titre"');

  if (error) {
    logError("BOOK_TITLE_RESOLUTION_ERROR", {
      title: trimmedTitle,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const matchingIds = (Array.isArray(data) ? data : [])
    .map((row) => ({
      id: readId((row as BookRow).id),
      title: readText((row as BookRow)["Titre"]),
    }))
    .filter((row) => row.id.length > 0 && normalizeBookFacetValue(row.title) === normalizedTitle)
    .map((row) => row.id);

  const uniqueIds = [...new Set(matchingIds)];

  if (uniqueIds.length === 1) {
    return { kind: "unique", id: uniqueIds[0] };
  }

  if (uniqueIds.length > 1) {
    return { kind: "multiple" };
  }

  return { kind: "none" };
});

export const getBookDetailById = cache(async (id: string): Promise<BookDetail | null> => {
  const trimmedId = id.trim();

  if (!trimmedId) {
    logWarn("BOOK_DETAIL_EMPTY_ID", { rawId: id });
    return null;
  }

  logInfo("BOOK_DETAIL_START", {
    id: trimmedId,
  });

  const [rowResult, totals, organizationCountryMap] = await Promise.all([
    supabase
      .from("data-books")
      .select(BOOK_DETAIL_SELECT)
      .eq("id", trimmedId)
      .maybeSingle(),
    getBooksDatabaseTotals(),
    getOrganizationCountryMap(),
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

  const row = (data as BookRow | null) ?? {};
  const rowId = readId(row.id);
  const [publishing, availability, pressReviews] = await Promise.all([
    getPublishingRows(row),
    Promise.resolve(buildAvailabilityRows(row, organizationCountryMap)),
    rowId ? getBookPressReviews(rowId) : Promise.resolve([]),
  ]);
  const detail = mapBookDetail(row, totals, availability, publishing, pressReviews);

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

  const [rowResult, totals, organizationCountryMap] = await Promise.all([
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
    getOrganizationCountryMap(),
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

  const row = (data as BookRow | null) ?? {};
  const rowId = readId(row.id);
  const [publishing, availability, pressReviews] = await Promise.all([
    getPublishingRows(row),
    Promise.resolve(buildAvailabilityRows(row, organizationCountryMap)),
    rowId ? getBookPressReviews(rowId) : Promise.resolve([]),
  ]);
  const detail = mapBookDetail(row, totals, availability, publishing, pressReviews);

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
