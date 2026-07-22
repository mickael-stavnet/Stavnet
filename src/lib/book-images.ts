import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const BOOK_COVER_DIR = path.join(process.cwd(), "public", "images", "books-cover");
const BOOK_COVER_FALLBACK_SRC = "/images/books-cover/book-cover-placeholder.png";

interface BookImageEntry {
  compact: string;
  key: string;
  src: string;
}

function normalizeBookImageKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLocaleLowerCase("fr");
}

function createCompactBookImageKey(value: string): string {
  return normalizeBookImageKey(value).replace(/-/g, "");
}

function cleanupBookImageLabel(value: string): string {
  return value
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(?:4couv|couv|jpg)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createBookImageVariants(value: string): string[] {
  const variants = new Set<string>();
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  const cleaned = cleanupBookImageLabel(trimmed);
  const colonFree = cleaned.split(/[:;\/]/)[0]?.trim() ?? "";
  const commaFree = cleaned.split(",")[0]?.trim() ?? "";

  for (const variant of [trimmed, cleaned, colonFree, commaFree]) {
    if (variant) {
      variants.add(variant);
    }
  }

  return Array.from(variants);
}

function buildBookImageEntry(name: string): BookImageEntry | null {
  const stem = name.replace(/\.[^.]+$/, "");
  const variants = createBookImageVariants(stem);
  const key = normalizeBookImageKey(variants[0] ?? "");
  const compact = createCompactBookImageKey(variants[0] ?? "");

  if (!key || !compact) {
    return null;
  }

  return {
    compact,
    key,
    src: `/images/books-cover/${name}`,
  };
}

function readBookCoverEntries(): BookImageEntry[] {
  if (!existsSync(BOOK_COVER_DIR)) {
    return [];
  }

  const entries = readdirSync(BOOK_COVER_DIR, { withFileTypes: true });
  const imageEntries: BookImageEntry[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !/\.(jpg|jpeg|webp)$/i.test(entry.name)) {
      continue;
    }

    const builtEntry = buildBookImageEntry(entry.name);

    if (builtEntry) {
      imageEntries.push(builtEntry);
    }
  }

  return imageEntries;
}

const BOOK_COVER_ENTRIES = readBookCoverEntries();

const BOOK_COVER_EXACT_MAP = new Map<string, string>();
const BOOK_COVER_COMPACT_MAP = new Map<string, string>();

for (const entry of BOOK_COVER_ENTRIES) {
  BOOK_COVER_EXACT_MAP.set(entry.key, entry.src);
  BOOK_COVER_COMPACT_MAP.set(entry.compact, entry.src);
}

interface BookImageCandidate {
  compact: string;
  key: string;
}

function createBookImageCandidates(value: string): BookImageCandidate[] {
  const variants = createBookImageVariants(value);
  const candidates: BookImageCandidate[] = [];
  const seen = new Set<string>();

  for (const variant of variants) {
    const key = normalizeBookImageKey(variant);
    const compact = createCompactBookImageKey(variant);

    if (!key || !compact || seen.has(compact)) {
      continue;
    }

    seen.add(compact);
    candidates.push({
      compact,
      key,
    });
  }

  return candidates;
}

export function resolveBookCoverSrc(...values: string[]): string {
  const candidates = values.flatMap(createBookImageCandidates);

  for (const candidate of candidates) {
    const exactMatch = BOOK_COVER_EXACT_MAP.get(candidate.key) ?? BOOK_COVER_COMPACT_MAP.get(candidate.compact);

    if (exactMatch) {
      return exactMatch;
    }
  }

  return BOOK_COVER_FALLBACK_SRC;
}
