import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { resolveBookCoverSrc } from "@/lib/book-images";

describe("resolveBookCoverSrc", () => {
  it("falls back when no cover matches", () => {
    expect(resolveBookCoverSrc("Unknown title")).toBe("/images/books-cover/book-cover-placeholder.png");
  });
});
