import { describe, expect, it } from "vitest";
import { entriesFromNames, normalizeShowcaseNames } from "@/lib/star-showcase";
import { resolvePersonDetailName, resolvePersonImageSrc } from "@/lib/person-images";

describe("star showcase selection", () => {
  it("keeps only known image-backed authors and removes duplicates", () => {
    expect(
      normalizeShowcaseNames([
        "Ami Bouganim",
        "Ami Bouganim",
        "Unknown Author",
        42,
      ]),
    ).toEqual(["Ami Bouganim"]);
  });

  it("maps persisted names back to local portrait entries", () => {
    expect(entriesFromNames(["Ami Bouganim"])).toEqual([
      {
        name: "Ami Bouganim",
        src: "/images/star-showcase/ami-bouganim.jpg",
        detailName: "Ami Bouganim",
      },
    ]);
  });

  it("keeps portraits without a person page in the showcase without a detail link", () => {
    expect(entriesFromNames(["Alec Borenstein"])).toEqual([
      {
        name: "Alec Borenstein",
        src: "/images/star-showcase/alec-borenstein.jpg",
        detailName: null,
      },
    ]);
  });

  it("returns an empty selection for an empty or invalid configuration", () => {
    expect(entriesFromNames([])).toEqual([]);
    expect(entriesFromNames(["Unknown Author"])).toEqual([]);
  });

  it("resolves portrait aliases to their author detail record", () => {
    expect(resolvePersonDetailName("Bar-Zohar")).toBe("Michel Bar-Zohar");
    expect(resolvePersonDetailName("Ben-Ner Yitzhak")).toBe("Itzhak Ben-Ner");
    expect(resolvePersonImageSrc("Michel Bar-Zohar", "Bar-Zohar Michel")).toBe("/images/persons/Bar-Zohar.jpg");
    expect(resolvePersonImageSrc("Itzhak Ben-Ner", "Ben-Ner Itzhak")).toBe("/images/persons/Ben-Ner Yitzhak.jpg");
  });
});
