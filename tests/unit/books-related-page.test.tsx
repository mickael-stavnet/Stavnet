import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const redirectError = new Error("redirect");
const notFoundError = new Error("notFound");
const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw redirectError;
  }),
);
const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw notFoundError;
  }),
);
const getBooksPageByFacetMock = vi.hoisted(() => vi.fn());
const getTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("@/i18n/routing", () => ({
  redirect: redirectMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: getTranslationsMock,
}));

vi.mock("@/lib/data/books", () => ({
  BOOKS_PAGE_SIZE: 13,
  getBooksPageByFacet: getBooksPageByFacetMock,
}));

vi.mock("@/lib/book-related", () => ({
  BOOK_RELATED_FACET_LABEL_KEYS: {
    authorName: "author",
    translationLanguage: "translationLanguage",
    authorType: "authorType",
    authorWritingLanguage: "authorWritingLanguage",
    contributorName: "contributor",
    contributorType: "contributorType",
    contributorLanguage: "contributorLanguage",
    publisherName: "publisher",
    publisherCountry: "publisherCountry",
    category: "category",
    subject: "subject",
    genre: "genre",
    targetAudience: "targetAudience",
  },
  isBookRelatedFacet: (value: string) => value === "authorWritingLanguage",
}));

vi.mock("@/lib/site-metadata", () => ({
  buildRelatedBooksPageMetadata: vi.fn(),
}));

vi.mock("@/components/stavnet/header", () => ({
  StavnetHeader: () => null,
}));

vi.mock("@/components/stavnet/footer", () => ({
  StavnetFooter: () => null,
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PaginationContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PaginationEllipsis: () => <span />,
  PaginationItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PaginationLink: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  PaginationNext: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  PaginationPrevious: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

import RelatedBooksPage from "@/app/[locale]/books/related/page";

describe("RelatedBooksPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    notFoundMock.mockClear();
    getBooksPageByFacetMock.mockReset();
    getTranslationsMock.mockReset();
    getTranslationsMock.mockImplementation(async () => (key: string) => key);
  });

  it("redirects to the book detail when the related facet matches a single book", async () => {
    getBooksPageByFacetMock.mockResolvedValueOnce({
      items: [{ id: "41", title: "Unique Title" }],
      page: 1,
      pageSize: 13,
      total: 1,
      totalPages: 1,
      databaseTotal: 99,
    });

    await expect(
      RelatedBooksPage({
        searchParams: Promise.resolve({
          facet: "authorWritingLanguage",
          value: "Hébreu",
          page: "1",
        }),
        params: Promise.resolve({ locale: "fr" }),
      }),
    ).rejects.toBe(redirectError);

    expect(getBooksPageByFacetMock).toHaveBeenCalledWith(1, "authorWritingLanguage", "Hébreu");
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
