import { describe, expect, it } from "vitest";
import { entriesFromNames, normalizeShowcaseNames } from "@/lib/star-showcase";

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
});
