import { describe, expect, it } from "vitest";
import { entriesFromNames, normalizeShowcaseNames } from "@/lib/star-showcase";
import { resolvePersonDetailName, resolvePersonImageSrc } from "@/lib/person-images";

describe("star showcase selection", () => {
  it("keeps only known image-backed authors and removes duplicates", () => {
    expect(
      normalizeShowcaseNames([
        "Agnon Shamuel Joseph",
        "Agnon Shamuel Joseph",
        "Unknown Author",
        42,
      ]),
    ).toEqual(["Agnon Shamuel Joseph"]);
  });

  it("maps persisted names back to local portrait entries", () => {
    expect(entriesFromNames(["Keret Edgar"])).toEqual([
      { name: "Keret Edgar", src: "/images/persons/Keret Edgar.jpg" },
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
