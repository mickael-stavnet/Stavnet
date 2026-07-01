import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const BOOK_COVER_DIR = path.join(process.cwd(), "public", "images", "books-cover");
const BOOK_COVER_FALLBACK_SRC = "/images/book-cover.jpg";

function normalizeBookImageKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLocaleLowerCase("fr");
}

function readBookCoverMap(): Map<string, string> {
  if (!existsSync(BOOK_COVER_DIR)) {
    return new Map();
  }

  const entries = readdirSync(BOOK_COVER_DIR, { withFileTypes: true });
  const map = new Map<string, string>();

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (!/\.(jpg|jpeg)$/i.test(entry.name)) {
      continue;
    }

    const stem = entry.name.replace(/\.[^.]+$/, "");
    const normalizedStem = normalizeBookImageKey(stem);

    if (!normalizedStem) {
      continue;
    }

    map.set(normalizedStem, `/images/books-cover/${entry.name}`);
  }

  return map;
}

const BOOK_COVER_MAP = readBookCoverMap();

function createBookImageCandidates(value: string): string[] {
  const normalized = normalizeBookImageKey(value);

  if (!normalized) {
    return [];
  }

  return [normalized];
}

export function resolveBookCoverSrc(...values: string[]): string {
  for (const value of values) {
    for (const candidate of createBookImageCandidates(value)) {
      const matchedImage = BOOK_COVER_MAP.get(candidate);

      if (matchedImage) {
        return matchedImage;
      }
    }
  }

  return BOOK_COVER_FALLBACK_SRC;
}
