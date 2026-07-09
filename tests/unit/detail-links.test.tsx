// @vitest-environment jsdom
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function serializeHref(href: unknown): string {
  if (typeof href === "string") {
    return href;
  }

  if (!href || typeof href !== "object" || !("pathname" in href)) {
    return "";
  }

  const pathname = String((href as { pathname: string }).pathname);
  const query = (href as { query?: Record<string, string> }).query ?? {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    params.set(key, value);
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, className, children }: { href: unknown; className?: string; children: ReactNode }) => (
    <a href={serializeHref(href)} className={className}>
      {children}
    </a>
  ),
}));

import {
  ClickableDetailValue,
  buildBookTitleResolverHref,
  buildOrganizationDetailHref,
  buildPersonDetailHref,
  buildRelatedBooksHref,
} from "@/lib/detail-links";

describe("detail links helpers", () => {
  it("builds the related books href", () => {
    expect(buildRelatedBooksHref("authorWritingLanguage", "Hébreu")).toEqual({
      pathname: "/books/related",
      query: {
        facet: "authorWritingLanguage",
        value: "Hébreu",
      },
    });
  });

  it("builds the by-title href", () => {
    expect(buildBookTitleResolverHref("Original Book")).toEqual({
      pathname: "/books/by-title",
      query: {
        title: "Original Book",
      },
    });
  });

  it("builds the person detail href with fallback", () => {
    expect(buildPersonDetailHref("Ada Aharoni", "authorName")).toEqual({
      pathname: "/persons/details",
      query: {
        name: "Ada Aharoni",
        fallbackFacet: "authorName",
        fallbackValue: "Ada Aharoni",
      },
    });
  });

  it("builds the organization detail href with fallback", () => {
    expect(buildOrganizationDetailHref("Fayard", "publisherName")).toEqual({
      pathname: "/orgs/details",
      query: {
        name: "Fayard",
        fallbackFacet: "publisherName",
        fallbackValue: "Fayard",
      },
    });
  });

  it("renders a permanently underlined clickable value", () => {
    render(
      <ClickableDetailValue
        href={buildRelatedBooksHref("publisherCountry", "France")}
        value="France"
      />,
    );

    const link = screen.getByRole("link", { name: "France" });
    expect(link).toHaveAttribute("href", "/books/related?facet=publisherCountry&value=France");
    expect(link.className).toContain("underline");
    expect(link.className).toContain("underline-offset-2");
  });
});
