import { beforeEach, describe, expect, it, vi } from "vitest";

const rpcMock = vi.hoisted(() => vi.fn());
const fromMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/d1-client", () => ({
  d1Client: {
    rpc: rpcMock,
    from: fromMock,
  },
}));

vi.mock("@/lib/server-log", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("@/lib/person-images", () => ({
  resolvePersonImageSrc: vi.fn(() => "/images/persons/default.jpg"),
}));

import { getPersonDetailByName } from "@/lib/data/persons";

describe("person detail name resolution", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
  });

  it("retries with the reversed name order when the direct lookup misses", async () => {
    rpcMock
      .mockResolvedValueOnce({
        data: null,
        error: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: {
          name: "Ada Aharoni",
          alternateName: "Aharoni Ada",
          type: "Auteur",
          language: "Hébreu",
          birthInfo: "1933",
          deathInfo: "",
          residence: "",
          professionalActivity: "Écrivain",
          biography: "Bio",
          bibliographyStats: {
            originalTitles: "2",
            translations: "4",
            publicationLanguages: "4",
          },
          bibliographyRows: [],
          stats: {
            cardsFound: "697",
            databaseContains: "1231",
          },
        },
        error: null,
        status: 200,
        statusText: "OK",
      });

    fromMock.mockImplementation(() => ({
      select: () => ({
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          status: 200,
          statusText: "OK",
        }),
      }),
    }));

    const detail = await getPersonDetailByName("Ada Aharoni");

    expect(detail?.name).toBe("Ada Aharoni");
    expect(rpcMock).toHaveBeenNthCalledWith(1, "get_person_detail_by_name", {
      p_name: "Ada Aharoni",
    });
    expect(rpcMock).toHaveBeenNthCalledWith(2, "get_person_detail_by_name", {
      p_name: "Aharoni Ada",
    });
  });

  it("falls back to an accent-insensitive table match when the rpc misses", async () => {
    rpcMock
      .mockResolvedValueOnce({
        data: null,
        error: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        data: {
          name: "Mickaël Pariente",
          alternateName: "Pariente Mickael",
          type: "Auteur",
          language: "Français",
          birthInfo: "",
          deathInfo: "",
          residence: "",
          professionalActivity: "",
          biography: "",
          bibliographyStats: {
            originalTitles: "0",
            translations: "0",
            publicationLanguages: "0",
          },
          bibliographyRows: [],
          stats: {
            cardsFound: "697",
            databaseContains: "1231",
          },
        },
        error: null,
        status: 200,
        statusText: "OK",
      });

    fromMock.mockImplementation((table: string) => ({
      select: () => ({
        range: vi.fn().mockResolvedValue({
          data: table === "data-person"
            ? [
                {
                  "Prénom Nom": "Mickaël Pariente",
                  "Nom Prénom": "Pariente Mickael",
                  "Auteur Original": "",
                },
              ]
            : [],
          error: null,
          status: 200,
          statusText: "OK",
        }),
      }),
    }));

    const detail = await getPersonDetailByName("Mickaél Parienté");

    expect(detail?.name).toBe("Mickaël Pariente");
    expect(rpcMock).toHaveBeenNthCalledWith(3, "get_person_detail_by_name", {
      p_name: "Mickaël Pariente",
    });
  });
});
