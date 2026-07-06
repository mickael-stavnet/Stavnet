import { describe, expect, it } from "vitest";
import { resolveBooksListSelection } from "@/lib/books-search";

describe("resolveBooksListSelection", () => {
  it("chooses the basic listing when there are no search params", () => {
    expect(resolveBooksListSelection({ page: "1" })).toEqual({
      pageNumber: 1,
      searchTerm: "",
      advancedFilters: {
        title: "",
        personLastName: "",
        personFirstName: "",
        organization: "",
        theme: "",
        publicationLanguage: "",
        year: "",
        generalSearch: "",
      },
      mode: "basic",
    });
  });

  it("chooses title search when q is present", () => {
    expect(resolveBooksListSelection({ page: "2", q: " Judas " })).toMatchObject({
      pageNumber: 2,
      searchTerm: "Judas",
      mode: "title",
    });
  });

  it("chooses advanced search when structured filters are present", () => {
    expect(resolveBooksListSelection({ page: "3", title: "Judas", organization: "Gallimard" })).toEqual({
      pageNumber: 3,
      searchTerm: "",
      advancedFilters: {
        title: "Judas",
        personLastName: "",
        personFirstName: "",
        organization: "Gallimard",
        theme: "",
        publicationLanguage: "",
        year: "",
        generalSearch: "",
      },
      mode: "advanced",
    });
  });
});
