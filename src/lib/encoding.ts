export function fixEncoding(text: string | null | number): string {
  if (text === null || text === undefined) return '';
  let str = String(text);

  str = str.replace(/Ma.ariv/g, "Ma'ariv");
  str = str.replace(/Isra.l/g, "Israël");
  str = str.replace(/L.Age d.Homme/g, "L'Âge d'Homme");

  return str;
}
