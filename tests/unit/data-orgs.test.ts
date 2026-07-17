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
    });
  });

  it("filters organizations by exact normalized type and search term", async () => {
    const organizationRows = [
      {
        Organisme: "Fayard",
        Type: "Editeur",
        Date_Creation: "1857",
        Pays: "France",
        Nb_Titres: "24",
        Nb_Auteurs: "5",
      },
      {
        Organisme: "Bibliothèque centrale",
        Type: "AutreOrganisme",
        Date_Creation: "",
        Pays: "France",
        Nb_Titres: "2",
        Nb_Auteurs: "1",
      },
      {
        Organisme: "Gallimard",
        Type: "Editeur",
        Date_Creation: "1911",
        Pays: "France",
        Nb_Titres: "17",
        Nb_Auteurs: "8",
      },
    ];

    fromMock.mockImplementation((table: string) => ({
      select: (_select: string, options?: { count?: string; head?: boolean }) => {
        if (table === "data-organism" && options?.head) {
          return Promise.resolve({
            count: 3,
            error: null,
            status: 200,
            statusText: "OK",
          });
        }

        return {
          range: vi.fn().mockResolvedValue({
            data: table === "data-organism" ? organizationRows : [],
            error: null,
            status: 200,
            statusText: "OK",
          }),
        };
      },
    }));

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
  });

  it("filters editor organizations by category", async () => {
    const organizationRows = [
      {
        Organisme: "Gallimard",
        Type: "Editeur",
        Date_Creation: "1911",
        Pays: "France",
        Nb_Titres: "17",
        Nb_Auteurs: "8",
      },
      {
        Organisme: "Bibliothèque centrale",
        Type: "AutreOrganisme",
        Date_Creation: "",
        Pays: "France",
        Nb_Titres: "2",
        Nb_Auteurs: "1",
      },
      {
        Organisme: "Site X",
        Type: "AutreOrganisme",
        Date_Creation: "",
        Pays: "France",
        Nb_Titres: "3",
        Nb_Auteurs: "1",
      },
    ];

    fromMock.mockImplementation((table: string) => ({
      select: (_select: string, options?: { count?: string; head?: boolean }) => {
        if (table === "data-organism" && options?.head) {
          return Promise.resolve({
            count: 3,
            error: null,
            status: 200,
            statusText: "OK",
          });
        }

        return {
          range: vi.fn().mockResolvedValue({
            data: table === "data-organism" ? organizationRows : [],
            error: null,
            status: 200,
            statusText: "OK",
          }),
        };
      },
    }));

    const result = await getOrganizationsPageByCategory(1, "Editeur");

    expect(result.items.map((item) => item.name)).toEqual(["Gallimard"]);
  });

  it("filters library organizations out of other organizations", async () => {
    const organizationRows = [
      {
        Organisme: "Bibliothèque centrale",
        Type: "AutreOrganisme",
        Date_Creation: "",
        Pays: "France",
        Nb_Titres: "2",
        Nb_Auteurs: "1",
      },
      {
        Organisme: "Atelier culturel",
        Type: "AutreOrganisme",
        Date_Creation: "",
        Pays: "France",
        Nb_Titres: "4",
        Nb_Auteurs: "2",
      },
      {
        Organisme: "Site X",
        Type: "AutreOrganisme",
        Date_Creation: "",
        Pays: "France",
        Nb_Titres: "3",
        Nb_Auteurs: "1",
      },
    ];

    fromMock.mockImplementation((table: string) => ({
      select: (_select: string, options?: { count?: string; head?: boolean }) => {
        if (table === "data-organism" && options?.head) {
          return Promise.resolve({
            count: 3,
            error: null,
            status: 200,
            statusText: "OK",
          });
        }

        return {
          range: vi.fn().mockResolvedValue({
            data: table === "data-organism" ? organizationRows : [],
            error: null,
            status: 200,
            statusText: "OK",
          }),
        };
      },
    }));

    const libraries = await getOrganizationsPageByCategory(1, "Bibliothèque");
    const others = await getOrganizationsPageByCategory(1, "AutreOrganisme", "", 1);

    expect(libraries.items.map((item) => item.name)).toEqual(["Bibliothèque centrale"]);
    expect(others.total).toBe(2);
    expect(others.totalPages).toBe(2);
    expect(others.items.map((item) => item.name)).toEqual(["Atelier culturel"]);
  });
});
