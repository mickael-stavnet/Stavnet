import { beforeEach, describe, expect, it, vi } from "vitest";

const rpcMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: rpcMock,
  },
}));

vi.mock("@/lib/server-log", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

import {
  getDefaultOrganizationDetail,
  getOrganizationDetailByName,
  getOrganizationsPage,
  getOrganizationsPageByName,
} from "@/lib/data/orgs";

describe("organizations data access", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("maps the organizations page response", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        items: [
          {
            name: "Am Oved",
            type: "publisher",
            creationDate: "1942",
            country: "Israel",
            publishedTitles: "14",
            publishedAuthors: "8",
          },
        ],
        totalCount: "1",
        databaseTotal: 3,
      },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await expect(getOrganizationsPage(1, 13)).resolves.toMatchObject({
      page: 1,
      pageSize: 13,
      total: 1,
      totalPages: 1,
      databaseTotal: 3,
      items: [
        {
          name: "Am Oved",
          type: "publisher",
          creationDate: "1942",
          country: "Israel",
          publishedTitles: "14",
          publishedAuthors: "8",
        },
      ],
    });
  });

  it("returns null for empty detail names", async () => {
    await expect(getOrganizationDetailByName("")).resolves.toBeNull();
  });

  it("returns the default organization detail through the RPC contract", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        name: "Default Org",
        synonym: "",
        type: "publisher",
        creationDate: "",
        country: "Israel",
        publishedStats: {
          titles: "2",
          authors: "1",
        },
        stats: {
          cardsFound: "1",
          databaseContains: "1",
        },
      },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await expect(getDefaultOrganizationDetail()).resolves.toMatchObject({
      name: "Default Org",
      publishedStats: {
        titles: "2",
        authors: "1",
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

    await getOrganizationsPageByName(2, "  Gallimard  ", 13);
    expect(rpcMock).toHaveBeenCalledWith("get_organizations_page", {
      p_page: 2,
      p_page_size: 13,
      p_search: "Gallimard",
    });
  });
});
