import { beforeEach, describe, expect, it, vi } from "vitest";

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
const getPersonDetailByNameMock = vi.hoisted(() => vi.fn());
const getDefaultPersonDetailMock = vi.hoisted(() => vi.fn());
const getBooksPageByFacetMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/i18n/routing", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/data/persons", () => ({
  getPersonDetailByName: getPersonDetailByNameMock,
  getDefaultPersonDetail: getDefaultPersonDetailMock,
}));

vi.mock("@/lib/data/books", () => ({
  getBooksPageByFacet: getBooksPageByFacetMock,
}));

vi.mock("@/lib/site-metadata", () => ({
  buildPersonPageMetadata: vi.fn(),
}));

vi.mock("@/app/[locale]/persons/person-detail-page", () => ({
  default: "person-detail-mock",
}));

import PersonDetailsPage from "@/app/[locale]/persons/details/page";

describe("PersonDetailsPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    notFoundMock.mockClear();
    getPersonDetailByNameMock.mockReset();
    getDefaultPersonDetailMock.mockReset();
    getBooksPageByFacetMock.mockReset();
  });

  it("renders the detail page when the person exists", async () => {
    getPersonDetailByNameMock.mockResolvedValueOnce({ name: "Ada Aharoni" });

    const page = await PersonDetailsPage({
      params: Promise.resolve({ locale: "fr" }),
      searchParams: Promise.resolve({ name: "Ada Aharoni" }),
    });

    expect(page).toMatchObject({
      type: "person-detail-mock",
      props: {
        person: {
          name: "Ada Aharoni",
        },
      },
    });
  });

  it("redirects to related books when the person is missing and a valid fallback is provided", async () => {
    getPersonDetailByNameMock.mockResolvedValueOnce(null);
    getBooksPageByFacetMock.mockResolvedValueOnce({ total: 1 });

    await expect(
      PersonDetailsPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          name: "Unknown Person",
          fallbackFacet: "authorName",
          fallbackValue: "Unknown Person",
        }),
      }),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books/related",
        query: {
          facet: "authorName",
          value: "Unknown Person",
        },
      },
      locale: "fr",
    });
  });

  it("redirects to a books search when the person is missing without related books", async () => {
    getPersonDetailByNameMock.mockResolvedValueOnce(null);

    await expect(
      PersonDetailsPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          name: "Unknown Person",
          fallbackFacet: "invalid",
          fallbackValue: "Unknown Person",
        }),
      }),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books",
        query: {
          page: "1",
          q: "Unknown Person",
        },
      },
      locale: "fr",
    });
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
