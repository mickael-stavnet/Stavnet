import { beforeEach, describe, expect, it, vi } from "vitest";

const rpcMock = vi.hoisted(() => vi.fn());
const fromMock = vi.hoisted(() => vi.fn());
const logErrorMock = vi.hoisted(() => vi.fn());
const logInfoMock = vi.hoisted(() => vi.fn());
const logWarnMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/d1-client", () => ({
  d1Client: {
    rpc: rpcMock,
    from: fromMock,
  },
}));

vi.mock("@/lib/server-log", () => ({
  logError: logErrorMock,
  logInfo: logInfoMock,
  logWarn: logWarnMock,
}));

import {
  getOrganizationsPageByCategory,
  getOrganizationsPageByType,
  ORGS_PAGE_SIZE,
} from "@/lib/data/orgs";

describe("organizations data access", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
    logErrorMock.mockReset();
    logInfoMock.mockReset();
    logWarnMock.mockReset();
  });

  it("falls back to the base organizations page when the type is empty", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        items: [
          {
            name: "Fayard",
            type: "Editeur",
            creationDate: "1857",
            country: "France",
            publishedTitles: "24",
            publishedAuthors: "5",
          },
        ],
        totalCount: "1",
        databaseTotal: 12,
      },
      error: null,
      status: 200,
      statusText: "OK",
    });

    const result = await getOrganizationsPageByType(2, "   ", "", ORGS_PAGE_SIZE);

    expect(result.page).toBe(2);
    expect(result.total).toBe(1);
    expect(rpcMock).toHaveBeenCalledWith("get_organizations_page", {
      p_page: 2,
      p_page_size: ORGS_PAGE_SIZE,
      p_search: null,
      p_type: null,
      p_category: null,
    });
  });

  it("filters organizations by exact normalized type and search term", async () => {
    rpcMock.mockResolvedValueOnce({ data: { items: [{ name: "Gallimard", type: "Editeur", creationDate: "1911", country: "France", publishedTitles: "17", publishedAuthors: "8" }], totalCount: 1, databaseTotal: 3 }, error: null, status: 200, statusText: "OK" });

    const result = await getOrganizationsPageByType(1, "  editeur ", " gall ", 13);

    expect(result.total).toBe(1);
    expect(result.items).toEqual([
      {
        name: "Gallimard",
        type: "Editeur",
        creationDate: "1911",
        country: "France",
        publishedTitles: "17",
        publishedAuthors: "8",
      },
    ]);
    expect(rpcMock).toHaveBeenCalledWith("get_organizations_page", { p_page: 1, p_page_size: 13, p_search: "gall", p_type: "editeur", p_category: null });
  });

  it("filters editor organizations by category", async () => {
    rpcMock.mockResolvedValueOnce({ data: { items: [{ name: "Gallimard", type: "Editeur", creationDate: "1911", country: "France", publishedTitles: "17", publishedAuthors: "8" }], totalCount: 1, databaseTotal: 3 }, error: null, status: 200, statusText: "OK" });

    const result = await getOrganizationsPageByCategory(1, "Editeur");

    expect(result.items.map((item) => item.name)).toEqual(["Gallimard"]);
    expect(rpcMock).toHaveBeenCalledWith("get_organizations_page", { p_page: 1, p_page_size: ORGS_PAGE_SIZE, p_search: null, p_type: null, p_category: "Editeur" });
  });

  it("filters library organizations out of other organizations", async () => {
    rpcMock.mockResolvedValueOnce({ data: { items: [{ name: "Bibliothèque centrale", type: "AutreOrganisme", creationDate: "", country: "France", publishedTitles: "2", publishedAuthors: "1" }], totalCount: 1, databaseTotal: 3 }, error: null, status: 200, statusText: "OK" }).mockResolvedValueOnce({ data: { items: [{ name: "Atelier culturel", type: "AutreOrganisme", creationDate: "", country: "France", publishedTitles: "4", publishedAuthors: "2" }], totalCount: 2, databaseTotal: 3 }, error: null, status: 200, statusText: "OK" });

    const libraries = await getOrganizationsPageByCategory(1, "Bibliothèque");
    const others = await getOrganizationsPageByCategory(1, "AutreOrganisme", "", 1);

    expect(libraries.items.map((item) => item.name)).toEqual(["Bibliothèque centrale"]);
    expect(others.total).toBe(2);
    expect(others.totalPages).toBe(2);
    expect(others.items.map((item) => item.name)).toEqual(["Atelier culturel"]);
  });
});
