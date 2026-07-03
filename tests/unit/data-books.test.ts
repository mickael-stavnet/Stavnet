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

vi.mock("@/lib/book-images", () => ({
  resolveBookCoverSrc: vi.fn(() => "/images/books-cover/book-cover-placeholder.png"),
}));

import { getBooksPageByFacet } from "@/lib/data/books";

describe("books data access", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("maps a facet page response", async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: "1",
            title: "A Book",
            author: "Author Name",
            publisher: "Publisher",
            language: "fr",
            year: "1980",
            publicationCode: "1",
          },
        ],
        totalCount: "1",
        databaseTotal: 9,
      },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await expect(getBooksPageByFacet(1, "authorName", "Author Name", 13)).resolves.toMatchObject({
      page: 1,
      pageSize: 13,
      total: 1,
      totalPages: 1,
      databaseTotal: 9,
      items: [
        {
          id: "1",
          title: "A Book",
          author: "Author Name",
          publisher: "Publisher",
          language: "fr",
          year: "1980",
        },
      ],
    });
  });

  it("trims the related facet search value", async () => {
    rpcMock.mockResolvedValueOnce({
      data: { items: [], totalCount: 0, databaseTotal: 0 },
      error: null,
      status: 200,
      statusText: "OK",
    });

    await getBooksPageByFacet(2, "authorName", "  Yehoshua  ", 13);
    expect(rpcMock).toHaveBeenCalledWith("get_books_page_by_facet", {
      p_page: 2,
      p_page_size: 13,
      p_facet: "authorName",
      p_value: "Yehoshua",
    });
  });
});
