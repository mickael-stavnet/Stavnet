import "server-only";

import { NextResponse } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export const MAX_QUERY_LENGTH = 200;
export const MAX_PAGE_SIZE = 100;
export const MAX_JSON_BODY_BYTES = 1_000_000;

export function errorResponse(status: 400 | 413 | 415 | 422 | 429, error: string): NextResponse {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export function readBoundedText(value: string | null, maxLength = MAX_QUERY_LENGTH): string | null {
  if (value === null) return null;
  const normalized = value.normalize("NFC").trim();
  if (normalized.length > maxLength || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(normalized)) return null;
  return normalized;
}

export function readBoundedPositiveInteger(value: string | null, fallback: number, maximum: number): number | null {
  if (value === null || value === "") return fallback;
  if (!/^\d+$/u.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : null;
}

export function contentLengthExceeded(request: Request, maximum = MAX_JSON_BODY_BYTES): boolean {
  const value = request.headers.get("content-length");
  return value !== null && (!/^\d+$/u.test(value) || Number(value) > maximum);
}

export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function allowRequest(request: Request, scope: string, limit: number, windowMs: number): boolean {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `${scope}:${forwarded || request.headers.get("x-real-ip") || "unknown"}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function isEntityType(value: unknown): value is "books" | "persons" | "organizations" {
  return value === "books" || value === "persons" || value === "organizations";
}

export function isSafeBlobUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\/[A-Za-z0-9-]+\.public\.blob\.vercel-storage\.com\/(books|persons|organizations)\/[A-Za-z0-9._-]+\.(?:jpg|png|webp)$/u.test(value);
}
