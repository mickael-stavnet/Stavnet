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

const PERSON_DETAIL_NAME_OVERRIDES = new Map<string, string>([
  ["Appelfeld Aharon", "Aharon Appelfeld"],
  ["Bar-Zohar", "Michel Bar-Zohar"],
  ["Ben-Ner Yitzhak", "Itzhak Ben-Ner"],
  ["Hameiri Israel", "Israel Hameiri"],
]);

const PERSON_IMAGE_NAME_OVERRIDES = new Map(
  Array.from(PERSON_DETAIL_NAME_OVERRIDES, ([portraitName, detailName]) => [detailName, portraitName]),
);

export type PersonImageEntry = {
  name: string;
  src: string;
  detailName: string | null;
};

const ADDITIONAL_PERSON_IMAGE_ENTRIES: readonly PersonImageEntry[] = [
  { name: "Miron C. Izakson", src: "/images/persons/miron-c-izakson.jpg", detailName: "Miron C. Izakson" },
  { name: "Ami Bouganim", src: "/images/persons/ami-bouganim.jpg", detailName: "Ami Bouganim" },
  { name: "Alec Borenstein", src: "/images/persons/alec-borenstein.jpg", detailName: null },
  { name: "Mickaël Parienté", src: "/images/persons/mickael-pariente.jpg", detailName: "Mickaël Parienté" },
  { name: "Zeruya Shalev", src: "/images/persons/zeruya-shalev.jpg", detailName: "Zeruya Shalev" },
  { name: "Shulamit Lapid", src: "/images/persons/shulamit-lapid.jpg", detailName: "Shulamit Lapid" },
  { name: "Ronny Someck", src: "/images/persons/ronny-someck.jpg", detailName: "Ronny Someck" },
  { name: "Josh=Yehoshua Shachar", src: "/images/persons/josh-yehoshua-shachar.png", detailName: null },
  { name: "Castel-Blum Orly", src: "/images/persons/castel-blum-orly.jpg", detailName: "Orly Castel-Bloom" },
  { name: "Dorit Orgad", src: "/images/persons/dorit-orgad.jpg", detailName: "Dorit Orgad" },
  { name: "Yehuda Lancry", src: "/images/persons/yehuda-lancry.jpg", detailName: null },
];

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
  [
    ...PERSON_IMAGE_BASE_NAMES.flatMap((baseName) =>
      createPersonImageCandidates(baseName).map(
        (candidate) => [candidate, `/images/persons/${baseName}.jpg`] as const,
      ),
    ),
    ...ADDITIONAL_PERSON_IMAGE_ENTRIES.flatMap((entry) =>
      createPersonImageCandidates(entry.name).map(
        (candidate) => [candidate, entry.src] as const,
      ),
    ),
  ],
);

export function getPersonImageSources(): string[] {
  return Array.from(new Set(PERSON_IMAGE_MAP.values()));
}

export function getPersonImageEntries(): PersonImageEntry[] {
  return [
    ...PERSON_IMAGE_BASE_NAMES.map((baseName) => ({
      name: baseName.trim(),
      src: `/images/persons/${baseName}.jpg`,
      detailName: resolvePersonDetailName(baseName.trim()),
    })),
    ...ADDITIONAL_PERSON_IMAGE_ENTRIES,
  ];
}

export function resolvePersonDetailName(name: string): string {
  return PERSON_DETAIL_NAME_OVERRIDES.get(name) ?? name;
}

export function resolvePersonImageSrc(
  name: string,
  alternateName: string,
): string {
  const candidates = [name, alternateName].flatMap((value) =>
    createPersonImageCandidates(value).concat(
      createPersonImageCandidates(PERSON_IMAGE_NAME_OVERRIDES.get(value) ?? ""),
    ),
  );

  for (const candidate of candidates) {
    const matchedImage = PERSON_IMAGE_MAP.get(candidate);
    if (matchedImage) {
      return matchedImage;
    }
  }

  return PERSON_IMAGE_FALLBACK_SRC;
}
