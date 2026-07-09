import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectError = new Error("redirect");
const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw redirectError;
  }),
);
const getOrganizationsPageByNameMock = vi.hoisted(() => vi.fn());
const getOrganizationsPageByTypeMock = vi.hoisted(() => vi.fn());
const getOrganizationsPageByCategoryMock = vi.hoisted(() => vi.fn());
const getOrganizationsPageMock = vi.hoisted(() => vi.fn());
const getTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("@/i18n/routing", () => ({
  Link: () => null,
  redirect: redirectMock,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: getTranslationsMock,
}));

vi.mock("@/lib/data/orgs", () => ({
  ORGS_PAGE_SIZE: 10,
  getOrganizationsPage: getOrganizationsPageMock,
  getOrganizationsPageByName: getOrganizationsPageByNameMock,
  getOrganizationsPageByType: getOrganizationsPageByTypeMock,
  getOrganizationsPageByCategory: getOrganizationsPageByCategoryMock,
}));

vi.mock("@/lib/orgs-search", () => ({
  ORGANIZATION_FILTER_OPTIONS: ["Editeur", "Bibliothèque", "AutreOrganisme"],
  buildOrganizationsPageHref: vi.fn(() => "?page=1"),
  resolveOrganizationsListSelection: vi.fn(() => ({
    pageNumber: 1,
    searchTerm: "Contact",
    typeFilter: "",
    categoryFilter: "",
    mode: "name",
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

import OrganizationsListPage from "@/app/[locale]/orgs/page";

describe("OrganizationsListPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    getOrganizationsPageByNameMock.mockReset();
    getOrganizationsPageByTypeMock.mockReset();
    getOrganizationsPageByCategoryMock.mockReset();
    getOrganizationsPageMock.mockReset();
    getTranslationsMock.mockReset();
    getTranslationsMock.mockImplementation(async () => (key: string) => key);
  });

  it("redirects to the organization detail when the search returns a single item", async () => {
    getOrganizationsPageByNameMock.mockResolvedValueOnce({
      items: [{ name: "Contact" }],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
      databaseTotal: 0,
    });

    await expect(
      OrganizationsListPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          page: "1",
          q: "Contact",
        }),
      }),
    ).rejects.toBe(redirectError);

    expect(getOrganizationsPageByNameMock).toHaveBeenCalledWith(1, "Contact", 10);
    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/orgs/details",
        query: {
          name: "Contact",
        },
      },
      locale: "fr",
    });
  });
});
