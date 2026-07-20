export function fixEncoding(text: string | null | number | undefined): string {
  if (text === null || text === undefined) return "";
  const str = String(text);
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str
      .replace(/[\uFFFD\uFFFD]/g, "é")
      .replace(/Ma.ariv/g, "Ma'ariv")
      .replace(/Isra.l/g, "Israël")
      .replace(/L.Age d.Homme/g, "L'Âge d'Homme")
      .replace(/pr.s/g, "près")
      .replace(/d.c.s/g, "décès")
      .replace(/prs/g, "près")
      .replace(/dcs/g, "décès");
  }
}
