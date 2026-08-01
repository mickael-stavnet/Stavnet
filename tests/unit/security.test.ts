import { describe, expect, it } from "vitest";
import {
  MAX_PAGE_SIZE,
  isSafeBlobUrl,
  readBoundedPositiveInteger,
  readBoundedText,
} from "@/lib/security";

describe("security input validation", () => {
  it("rejects malformed and oversized pagination", () => {
    expect(readBoundedPositiveInteger("12", 1, MAX_PAGE_SIZE)).toBe(12);
    expect(readBoundedPositiveInteger("1e2", 1, MAX_PAGE_SIZE)).toBeNull();
    expect(readBoundedPositiveInteger("0", 1, MAX_PAGE_SIZE)).toBeNull();
    expect(readBoundedPositiveInteger("101", 1, MAX_PAGE_SIZE)).toBeNull();
  });

  it("rejects unsafe search values", () => {
    expect(readBoundedText("  auteur  ")).toBe("auteur");
    expect(readBoundedText("a\u0000b")).toBeNull();
    expect(readBoundedText("x".repeat(201))).toBeNull();
  });

  it("accepts only generated image blob paths", () => {
    expect(isSafeBlobUrl("https://abc.public.blob.vercel-storage.com/books/550e8400-e29b-41d4-a716-446655440000.webp")).toBe(true);
    expect(isSafeBlobUrl("https://abc.public.blob.vercel-storage.com/books/file.svg")).toBe(false);
    expect(isSafeBlobUrl("https://example.com/books/file.webp")).toBe(false);
  });
});
