const PERSON_IMAGE_BASE_NAMES = [
  "Agnon Shamuel Joseph",
  "Aharoni Ada",
  "Akavia Miriam",
  "Al Qasim Samikh",
  "Almagor Gila",
  "Appelfeld Aharon",
  "Araydi Naim",
  "Bar-Zohar",
  "Ben Shaul Moshe",
  "Ben-Ner Yitzhak",
  "Bialik Haïm Nahman",
  "Castel-Bloom Orly",
  "Dan Tsalka",
  "Eliraz Israel",
  "Fink Ida",
  "Grossman David",
  "Guiladi Yael",
  "Gur Batya",
  "Habibi Emile",
  "Hameiri Israel",
  "Haya Esther",
  "Horn Shifra",
  "Izakson Miron",
  "Kandel Felix",
  "Kashua",
  "Katzit Yehudit",
  "Kenaz Yehusua",
  "Keret Edgar",
  "Kimhi Alona",
  "Koren Yesha'yahu",
  "Lapid Shulamit",
  "Lapide E. Pinchas",
  "Lev Eleonora",
  "Megged Aharon",
  "Moked",
  "Oren Itzhak",
  "Oren Ram",
  "Orgad Dorit",
  "Orlev uri",
  "Orpaz Yitshak",
  "Rabinyan Dorit",
  "Réuvéni Yotam",
  "Ron-Feder  Galila",
  "Sena Igal",
  "Senesh",
  "Shabtai Yaakov ",
  "Shahar David",
  "Shahrur Tsipi",
  "Shalev Zeruya",
  "Shammas Anton",
  "Someq Roni",
  "Tchernichovsky Saul",
  "Wahib Nadim Wahabe",
  "Yehoshua A.B.",
  "Yehudit Katzir",
  "Yevy",
  "Zach Natan",
  "Zarhi",
] as const;

const PERSON_IMAGE_FALLBACK_SRC =
  "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352156-stock-illustration-default-placeholder-profile-icon.jpg";

function normalizePersonImageKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLocaleLowerCase("fr");
}

function createPersonImageCandidates(value: string): string[] {
  const normalized = normalizePersonImageKey(value);
  if (!normalized) {
    return [];
  }

  const words = normalized.split("-").filter(Boolean);
  const reversed = words.length > 1 ? words.slice().reverse().join("-") : "";
  return reversed && reversed !== normalized
    ? [normalized, reversed]
    : [normalized];
}

const PERSON_IMAGE_MAP = new Map(
  PERSON_IMAGE_BASE_NAMES.flatMap((baseName) =>
    createPersonImageCandidates(baseName).map(
      (candidate) => [candidate, `/images/persons/${baseName}.jpg`] as const,
    ),
  ),
);

export function resolvePersonImageSrc(
  name: string,
  alternateName: string,
): string {
  const candidates = [
    ...createPersonImageCandidates(name),
    ...createPersonImageCandidates(alternateName),
  ];

  for (const candidate of candidates) {
    const matchedImage = PERSON_IMAGE_MAP.get(candidate);
    if (matchedImage) {
      return matchedImage;
    }
  }

  return PERSON_IMAGE_FALLBACK_SRC;
}
