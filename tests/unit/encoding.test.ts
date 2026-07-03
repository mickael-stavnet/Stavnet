import { describe, expect, it } from "vitest";
import { fixEncoding } from "@/lib/encoding";

describe("fixEncoding", () => {
  it("returns an empty string for nullish input", () => {
    expect(fixEncoding(null)).toBe("");
    expect(fixEncoding(undefined)).toBe("");
  });

  it("repairs common broken encodings", () => {
    expect(fixEncoding(`Isra.l\uD800`)).toContain("Israël");
    expect(fixEncoding(`Ma.ariv\uD800`)).toContain("Ma'ariv");
    expect(fixEncoding(`L.Age d.Homme\uD800`)).toContain("L'Âge d'Homme");
  });
});
