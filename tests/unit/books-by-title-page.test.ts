import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectError = new Error("redirect");
const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw redirectError;
  }),
);
const resolveBookByExactTitleMock = vi.hoisted(() => vi.fn());

vi.mock("@/i18n/routing", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/data/books", () => ({
  resolveBookByExactTitle: resolveBookByExactTitleMock,
}));

import BooksByTitlePage from "@/app/[locale]/books/by-title/page";

describe("BooksByTitlePage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    resolveBookByExactTitleMock.mockReset();
  });

  it("redirects to the books list when the title is empty", async () => {
    await expect(
      BooksByTitlePage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({ title: "   " }),
      }),
    ).rejects.toBe(redirectError);

    expect(resolveBookByExactTitleMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books",
        query: {
          page: "1",
        },
      },
      locale: "fr",
    });
  });

  it("redirects to the book detail when the exact title resolves uniquely", async () => {
    resolveBookByExactTitleMock.mockResolvedValueOnce({
      kind: "unique",
      id: "41",
    });

    await expect(
      BooksByTitlePage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({ title: "  Unique Title  " }),
      }),
    ).rejects.toBe(redirectError);

    expect(resolveBookByExactTitleMock).toHaveBeenCalledWith("Unique Title");
    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books/details",
        query: {
          id: "41",
        },
      },
      locale: "fr",
    });
  });

  it("redirects to the books list search when several titles match", async () => {
    resolveBookByExactTitleMock.mockResolvedValueOnce({
      kind: "multiple",
    });

    await expect(
      BooksByTitlePage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({ title: " Shared Title " }),
      }),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books",
        query: {
          page: "1",
          q: "Shared Title",
        },
      },
      locale: "fr",
    });
  });

  it("redirects to the books list search when no exact title matches", async () => {
    resolveBookByExactTitleMock.mockResolvedValueOnce({
      kind: "none",
    });

    await expect(
      BooksByTitlePage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({ title: " Missing Title " }),
      }),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith({
      href: {
        pathname: "/books",
        query: {
          page: "1",
          q: "Missing Title",
        },
      },
      locale: "fr",
    });
  });
});
