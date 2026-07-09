import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectError = new Error("redirect");
const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw redirectError;
  }),
);
const getBooksPageByTitleMock = vi.hoisted(() => vi.fn());
const getBooksPageByAdvancedSearchMock = vi.hoisted(() => vi.fn());
const getBooksPageMock = vi.hoisted(() => vi.fn());
const getTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("@/i18n/routing", () => ({
  Link: () => null,
  redirect: redirectMock,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: getTranslationsMock,
}));

vi.mock("@/lib/data/books", () => ({
  BOOKS_PAGE_SIZE: 13,
  getBooksPage: getBooksPageMock,
  getBooksPageByTitle: getBooksPageByTitleMock,
  getBooksPageByAdvancedSearch: getBooksPageByAdvancedSearchMock,
}));

vi.mock("@/lib/books-search", () => ({
  resolveBooksListSelection: vi.fn(() => ({
    pageNumber: 1,
    searchTerm: "De grammatica van het gevoel",
    advancedFilters: {},
    mode: "title",
  })),
}));

vi.mock("@/lib/site-metadata", () => ({
  buildStaticPageMetadata: vi.fn(),
}));

vi.mock("@/components/stavnet/header", () => ({
  StavnetHeader: () => null,
}));

vi.mock("@/components/stavnet/footer", () => ({
  StavnetFooter: () => null,
}));

vi.mock("@/components/stavnet/list-name-search", () => ({
  ListNameSearch: () => null,
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: () => null,
  PaginationContent: () => null,
  PaginationEllipsis: () => null,
  PaginationItem: () => null,
  PaginationLink: () => null,
  PaginationNext: () => null,
  PaginationPrevious: () => null,
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

import BooksListPage from "@/app/[locale]/books/page";

describe("BooksListPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    getBooksPageByTitleMock.mockReset();
    getBooksPageByAdvancedSearchMock.mockReset();
    getBooksPageMock.mockReset();
    getTranslationsMock.mockReset();
    getTranslationsMock.mockImplementation(async () => (key: string) => key);
  });

  it("redirects to the book detail when the books list search returns a single item", async () => {
    getBooksPageByTitleMock.mockResolvedValueOnce({
      items: [{ id: "41", title: "De grammatica van het gevoel" }],
      page: 1,
      pageSize: 13,
      total: 1,
      totalPages: 1,
      databaseTotal: 4998,
    });

    await expect(
      BooksListPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          page: "1",
          q: "De grammatica van het gevoel",
        }),
      }),
    ).rejects.toBe(redirectError);

    expect(getBooksPageByTitleMock).toHaveBeenCalledWith(1, "De grammatica van het gevoel");
    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books/details",
        query: {
          id: "41",
        },
      },
      locale: "fr",
    });
  });
});
