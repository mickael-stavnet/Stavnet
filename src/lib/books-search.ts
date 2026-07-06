import type { BookSearchFilters } from "@/lib/data/books";

export interface BooksSearchParams {
  page?: string;
  q?: string;
  title?: string;
  personLastName?: string;
  personFirstName?: string;
  organization?: string;
  theme?: string;
  publicationLanguage?: string;
  year?: string;
  generalSearch?: string;
}

export interface BooksListSelection {
  pageNumber: number;
  searchTerm: string;
  advancedFilters: Partial<BookSearchFilters>;
  mode: "basic" | "title" | "advanced";
}

export function resolveBooksListSelection({
  page,
  q,
  title,
  personLastName,
  personFirstName,
  organization,
  theme,
  publicationLanguage,
  year,
  generalSearch,
}: BooksSearchParams): BooksListSelection {
  const currentPage = Number.parseInt(page ?? "1", 10);
  const searchTerm = (q ?? "").trim();
  const advancedFilters: Partial<BookSearchFilters> = {
    title: title?.trim() ?? "",
    personLastName: personLastName?.trim() ?? "",
    personFirstName: personFirstName?.trim() ?? "",
    organization: organization?.trim() ?? "",
    theme: theme?.trim() ?? "",
    publicationLanguage: publicationLanguage?.trim() ?? "",
    year: year?.trim() ?? "",
    generalSearch: generalSearch?.trim() ?? "",
  };
  const hasAdvancedFilters = Object.values(advancedFilters).some((value) => value.length > 0);
  const pageNumber = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const mode: BooksListSelection["mode"] = hasAdvancedFilters ? "advanced" : searchTerm ? "title" : "basic";

  return {
    pageNumber,
    searchTerm,
    advancedFilters,
    mode,
  };
}
