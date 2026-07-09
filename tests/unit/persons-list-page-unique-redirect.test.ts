import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectError = new Error("redirect");
const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw redirectError;
  }),
);
const getPersonsPageByNameMock = vi.hoisted(() => vi.fn());
const getPersonsPageMock = vi.hoisted(() => vi.fn());
const getTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("@/i18n/routing", () => ({
  Link: () => null,
  redirect: redirectMock,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: getTranslationsMock,
}));

vi.mock("@/lib/data/persons", () => ({
  PERSONS_PAGE_SIZE: 10,
  getPersonsPage: getPersonsPageMock,
  getPersonsPageByName: getPersonsPageByNameMock,
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

import PersonsListPage from "@/app/[locale]/persons/page";

describe("PersonsListPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    getPersonsPageByNameMock.mockReset();
    getPersonsPageMock.mockReset();
    getTranslationsMock.mockReset();
    getTranslationsMock.mockImplementation(async () => (key: string) => key);
  });

  it("redirects to the person detail when the search returns a single item", async () => {
    getPersonsPageByNameMock.mockResolvedValueOnce({
      items: [{ name: "Ada Aharoni" }],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
      databaseTotal: 0,
    });

    await expect(
      PersonsListPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          page: "1",
          q: "Ada Aharoni",
        }),
      }),
    ).rejects.toBe(redirectError);

    expect(getPersonsPageByNameMock).toHaveBeenCalledWith(1, "Ada Aharoni", 10);
    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/persons/details",
        query: {
          name: "Ada Aharoni",
        },
      },
      locale: "fr",
    });
  });
});
