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
const getOrganizationDetailByNameMock = vi.hoisted(() => vi.fn());
const getDefaultOrganizationDetailMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/i18n/routing", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/data/orgs", () => ({
  getOrganizationDetailByName: getOrganizationDetailByNameMock,
  getDefaultOrganizationDetail: getDefaultOrganizationDetailMock,
}));

vi.mock("@/lib/site-metadata", () => ({
  buildOrganizationPageMetadata: vi.fn(),
}));

vi.mock("@/app/[locale]/orgs/orgs-detail-page", () => ({
  default: "org-detail-mock",
}));

import OrganizationDetailsPage from "@/app/[locale]/orgs/details/page";

describe("OrganizationDetailsPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    notFoundMock.mockClear();
    getOrganizationDetailByNameMock.mockReset();
    getDefaultOrganizationDetailMock.mockReset();
  });

  it("renders the detail page when the organization exists", async () => {
    getOrganizationDetailByNameMock.mockResolvedValueOnce({ name: "Fayard" });

    const page = await OrganizationDetailsPage({
      params: Promise.resolve({ locale: "fr" }),
      searchParams: Promise.resolve({ name: "Fayard" }),
    });

    expect(page).toMatchObject({
      type: "org-detail-mock",
      props: {
        organization: {
          name: "Fayard",
        },
      },
    });
  });

  it("redirects to related books when the organization is missing and a valid fallback is provided", async () => {
    getOrganizationDetailByNameMock.mockResolvedValueOnce(null);

    await expect(
      OrganizationDetailsPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          name: "Unknown Org",
          fallbackFacet: "publisherName",
          fallbackValue: "Unknown Org",
        }),
      }),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books/related",
        query: {
          facet: "publisherName",
          value: "Unknown Org",
        },
      },
      locale: "fr",
    });
  });

  it("falls through to notFound when the organization is missing without a valid fallback", async () => {
    getOrganizationDetailByNameMock.mockResolvedValueOnce(null);

    await expect(
      OrganizationDetailsPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          name: "Unknown Org",
          fallbackFacet: "invalid",
          fallbackValue: "Unknown Org",
        }),
      }),
    ).rejects.toBe(notFoundError);

    expect(notFoundMock).toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
