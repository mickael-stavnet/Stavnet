import { describe, expect, it } from "vitest";
import { isPageWithinLimit, MAX_BOOKS_PAGE, MAX_ORGANIZATIONS_PAGE } from "@/lib/pagination";

describe("pagination limits", () => {
  it("accepts pages inside the configured limits", () => {
    expect(isPageWithinLimit(1, MAX_BOOKS_PAGE)).toBe(true);
    expect(isPageWithinLimit(MAX_ORGANIZATIONS_PAGE, MAX_ORGANIZATIONS_PAGE)).toBe(true);
  });

  it("rejects invalid and oversized pages", () => {
    expect(isPageWithinLimit(0, MAX_BOOKS_PAGE)).toBe(false);
    expect(isPageWithinLimit(-1, MAX_BOOKS_PAGE)).toBe(false);
    expect(isPageWithinLimit(MAX_BOOKS_PAGE + 1, MAX_BOOKS_PAGE)).toBe(false);
    expect(isPageWithinLimit(1.5, MAX_BOOKS_PAGE)).toBe(false);
  });
});
