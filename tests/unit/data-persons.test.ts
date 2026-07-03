import { beforeEach, describe, expect, it, vi } from "vitest";

const rpcMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: rpcMock,
  },
}));

vi.mock("@/lib/person-images", () => ({
  resolvePersonImageSrc: vi.fn(() => "/images/persons/fallback.jpg"),
}));

vi.mock("@/lib/server-log", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

import {
  getDefaultPersonDetail,
  getPersonDetailByName,
  getPersonsPage,
  getPersonsPageByName,
} from "@/lib/data/persons";

describe("persons data access", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("maps the persons page response", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        items: [
          {
            name: "Aharon Appelfeld",
            type: "writer",
            language: "he",
            originalTitles: "3",
            translatedTitles: "2",
            translationLanguages: "5",
            awards: "1",
            regularReissues: null,
            pocketReissues: undefined,
            publicationCountries: "7",
          },
        ],
        totalCount: "13",
        databaseTotal: 42,
      },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await expect(getPersonsPage(0, 13)).resolves.toMatchObject({
      page: 1,
      pageSize: 13,
      total: 13,
      totalPages: 1,
      databaseTotal: 42,
      items: [
        {
          name: "Aharon Appelfeld",
          type: "writer",
          language: "he",
          originalTitles: "3",
          translatedTitles: "2",
          translationLanguages: "5",
          awards: "1",
          regularReissues: "0",
          pocketReissues: "0",
          publicationCountries: "7",
        },
      ],
    });
  });

  it("returns null for empty detail names", async () => {
    await expect(getPersonDetailByName("   ")).resolves.toBeNull();
  });

  it("returns the default person detail through the RPC contract", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        name: "Default Person",
        alternateName: "",
        type: "writer",
        language: "fr",
        birthInfo: "",
        deathInfo: "",
        residence: "",
        professionalActivity: "",
        biography: "",
        bibliographyStats: {
          originalTitles: "1",
          translations: "0",
          publicationLanguages: "1",
        },
        bibliographyRows: [],
        stats: {
          cardsFound: "1",
          databaseContains: "1",
        },
      },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await expect(getDefaultPersonDetail()).resolves.toMatchObject({
      name: "Default Person",
      bibliographyStats: {
        originalTitles: "1",
        translations: "0",
        publicationLanguages: "1",
      },
      stats: {
        cardsFound: "1",
        databaseContains: "1",
      },
    });
  });

  it("supports search paging with the trimmed search term", async () => {
    rpcMock.mockResolvedValueOnce({
      data: { items: [], totalCount: 0, databaseTotal: 0 },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await getPersonsPageByName(2, "  Grossman  ", 13);
    expect(rpcMock).toHaveBeenCalledWith("get_persons_page", {
      p_page: 2,
      p_page_size: 13,
      p_search: "Grossman",
    });
  });
});
