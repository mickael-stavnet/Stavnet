import { describe, expect, it } from "vitest";
import {
  buildOrganizationsPageHref,
  resolveOrganizationsListSelection,
} from "@/lib/orgs-search";

describe("orgs search helpers", () => {
  it("resolves a category selection for known type filters", () => {
    expect(resolveOrganizationsListSelection({ page: "2", q: " Fayard ", type: "Editeur" })).toEqual({
      pageNumber: 2,
      searchTerm: "Fayard",
      typeFilter: "Editeur",
      countryFilter: "",
      categoryFilter: "Editeur",
      mode: "category",
    });
  });

  it("resolves a free type selection for unknown type filters", () => {
    expect(resolveOrganizationsListSelection({ page: "1", type: "Diffuseur" })).toEqual({
      pageNumber: 1,
      searchTerm: "",
      typeFilter: "Diffuseur",
      countryFilter: "",
      categoryFilter: "",
      mode: "type",
    });
  });

  it("resolves a basic name search when only q is present", () => {
    expect(resolveOrganizationsListSelection({ page: "-4", q: " Gallimard " })).toEqual({
      pageNumber: 1,
      searchTerm: "Gallimard",
      typeFilter: "",
      countryFilter: "",
      categoryFilter: "",
      mode: "name",
    });
  });

  it("preserves type and search params in pagination hrefs", () => {
    expect(buildOrganizationsPageHref(3, "Fayard", "Editeur")).toBe("?page=3&q=Fayard&type=Editeur");
  });

  it("resolves and preserves a publisher-country filter", () => {
    expect(resolveOrganizationsListSelection({ page: "2", country: "Pays-Bas" })).toEqual({
      pageNumber: 2,
      searchTerm: "",
      typeFilter: "",
      countryFilter: "Pays-Bas",
      categoryFilter: "",
      mode: "country",
    });
    expect(buildOrganizationsPageHref(3, "", "", "Pays-Bas")).toBe("?page=3&country=Pays-Bas");
  });
});
