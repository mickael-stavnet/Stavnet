import { describe, expect, it } from "vitest";
import { enrichPersonBibliographyRows, parsePersonBibliographyIssue } from "@/hooks/use-person-bibliography";
import type { PersonBibliographyRow } from "@/lib/data/persons";

describe("person bibliography helpers", () => {
  it("extracts parution and faconnage from a bibliography code", () => {
    expect(parsePersonBibliographyIssue("00009-T-L06-R-E01")).toEqual({
      parution: "E01",
      faconnage: "R",
    });
  });

  it("sorts originals before translations and newest years first within each group", () => {
    const rows: PersonBibliographyRow[] = [
      {
        type: "Traduction",
        language: "Français",
        title: "Translated 1994",
        year: "1994",
        issue: "00008-T-L06-R-E02",
      },
      {
        type: "Original",
        language: "Hébreu",
        title: "Original 1988",
        year: "1988",
        issue: "",
      },
      {
        type: "Original",
        language: "Hébreu",
        title: "Original 1992",
        year: "1992",
        issue: "",
      },
      {
        type: "Traduction",
        language: "Français",
        title: "Translated 2001",
        year: "2001",
        issue: "00009-T-L06-R-E01",
      },
    ];

    expect(enrichPersonBibliographyRows(rows).map((row) => row.title)).toEqual([
      "Original 1992",
      "Original 1988",
      "Translated 2001",
      "Translated 1994",
    ]);
  });
});
