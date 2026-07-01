import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const BOOK_COVER_DIR = path.join(process.cwd(), "public", "images", "books-cover");
const BOOK_COVER_FALLBACK_SRC = "/images/book-cover.jpg";
const BOOK_IMAGE_MIN_PREFIX_LENGTH = 8;
const BOOK_IMAGE_MIN_FUZZY_SCORE = 0.72;
const BOOK_IMAGE_STOP_WORDS = new Set([
  "a",
  "au",
  "aux",
  "ce",
  "ces",
  "dans",
  "de",
  "des",
  "du",
  "el",
  "en",
  "et",
  "l",
  "la",
  "le",
  "les",
  "of",
  "ou",
  "sur",
  "the",
  "un",
  "une",
]);

interface BookImageEntry {
  compact: string;
  key: string;
  src: string;
  tokens: string[];
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

function tokenizeBookImageKey(value: string): string[] {
  return normalizeBookImageKey(value)
    .split("-")
    .filter((token) => token.length > 1 && !BOOK_IMAGE_STOP_WORDS.has(token));
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

function getBookImageBigrams(value: string): string[] {
  if (value.length < 2) {
    return value ? [value] : [];
  }

  const bigrams: string[] = [];

  for (let index = 0; index < value.length - 1; index += 1) {
    bigrams.push(value.slice(index, index + 2));
  }

  return bigrams;
}

function scoreCompactSimilarity(left: string, right: string): number {
  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const leftBigrams = getBookImageBigrams(left);
  const rightBigrams = getBookImageBigrams(right);

  if (leftBigrams.length === 0 || rightBigrams.length === 0) {
    return 0;
  }

  const rightCounts = new Map<string, number>();

  for (const bigram of rightBigrams) {
    rightCounts.set(bigram, (rightCounts.get(bigram) ?? 0) + 1);
  }

  let overlap = 0;

  for (const bigram of leftBigrams) {
    const count = rightCounts.get(bigram) ?? 0;

    if (count > 0) {
      overlap += 1;
      rightCounts.set(bigram, count - 1);
    }
  }

  return (2 * overlap) / (leftBigrams.length + rightBigrams.length);
}

function scoreTokenSimilarity(candidateTokens: string[], entryTokens: string[]): number {
  if (candidateTokens.length === 0 || entryTokens.length === 0) {
    return 0;
  }

  let overlap = 0;

  for (const candidateToken of candidateTokens) {
    if (entryTokens.some((entryToken) => entryToken === candidateToken || entryToken.startsWith(candidateToken) || candidateToken.startsWith(entryToken))) {
      overlap += 1;
    }
  }

  return overlap / Math.max(candidateTokens.length, entryTokens.length);
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
    tokens: tokenizeBookImageKey(variants[0] ?? ""),
  };
}

function readBookCoverEntries(): BookImageEntry[] {
  if (!existsSync(BOOK_COVER_DIR)) {
    return [];
  }

  const entries = readdirSync(BOOK_COVER_DIR, { withFileTypes: true });
  const imageEntries: BookImageEntry[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !/\.(jpg|jpeg)$/i.test(entry.name)) {
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
  tokens: string[];
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
      tokens: tokenizeBookImageKey(variant),
    });
  }

  return candidates;
}

function findBestPrefixMatch(candidate: BookImageCandidate): string | null {
  let bestMatch: { delta: number; src: string } | null = null;

  for (const entry of BOOK_COVER_ENTRIES) {
    const keysSharePrefix =
      (candidate.key.length >= BOOK_IMAGE_MIN_PREFIX_LENGTH && entry.key.startsWith(candidate.key)) ||
      (entry.key.length >= BOOK_IMAGE_MIN_PREFIX_LENGTH && candidate.key.startsWith(entry.key)) ||
      (candidate.compact.length >= BOOK_IMAGE_MIN_PREFIX_LENGTH && entry.compact.startsWith(candidate.compact)) ||
      (entry.compact.length >= BOOK_IMAGE_MIN_PREFIX_LENGTH && candidate.compact.startsWith(entry.compact));

    if (!keysSharePrefix) {
      continue;
    }

    const delta = Math.abs(entry.compact.length - candidate.compact.length);

    if (!bestMatch || delta < bestMatch.delta) {
      bestMatch = {
        delta,
        src: entry.src,
      };
    }
  }

  return bestMatch?.src ?? null;
}

function findBestFuzzyMatch(candidate: BookImageCandidate): string | null {
  let bestMatch: { score: number; src: string } | null = null;

  for (const entry of BOOK_COVER_ENTRIES) {
    if (candidate.tokens.length > 0 && entry.tokens.length > 0 && candidate.tokens[0] !== entry.tokens[0]) {
      continue;
    }

    const tokenScore = scoreTokenSimilarity(candidate.tokens, entry.tokens);
    const compactScore = scoreCompactSimilarity(candidate.compact, entry.compact);
    const score = compactScore * 0.65 + tokenScore * 0.35;

    if (score < BOOK_IMAGE_MIN_FUZZY_SCORE) {
      continue;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        score,
        src: entry.src,
      };
    }
  }

  return bestMatch?.src ?? null;
}

export function resolveBookCoverSrc(...values: string[]): string {
  const candidates = values.flatMap(createBookImageCandidates);

  for (const candidate of candidates) {
    const exactMatch = BOOK_COVER_EXACT_MAP.get(candidate.key) ?? BOOK_COVER_COMPACT_MAP.get(candidate.compact);

    if (exactMatch) {
      return exactMatch;
    }
  }

  for (const candidate of candidates) {
    const prefixMatch = findBestPrefixMatch(candidate);

    if (prefixMatch) {
      return prefixMatch;
    }
  }

  for (const candidate of candidates) {
    const fuzzyMatch = findBestFuzzyMatch(candidate);

    if (fuzzyMatch) {
      return fuzzyMatch;
    }
  }

  return BOOK_COVER_FALLBACK_SRC;
}
