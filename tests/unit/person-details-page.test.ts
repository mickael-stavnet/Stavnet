import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundError = new Error("notFound");
const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw notFoundError;
  }),
);
const getPersonDetailByNameMock = vi.hoisted(() => vi.fn());
const getDefaultPersonDetailMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/lib/data/persons", () => ({
  getPersonDetailByName: getPersonDetailByNameMock,
  getDefaultPersonDetail: getDefaultPersonDetailMock,
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
    notFoundMock.mockClear();
    getPersonDetailByNameMock.mockReset();
    getDefaultPersonDetailMock.mockReset();
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

  it("keeps an unknown author on the person-detail flow", async () => {
    getPersonDetailByNameMock.mockResolvedValueOnce(null);

    await expect(
      PersonDetailsPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({
          name: "Unknown Person",
          fallbackFacet: "authorName",
          fallbackValue: "Unknown Person",
        }),
      }),
    ).rejects.toBe(notFoundError);

    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
