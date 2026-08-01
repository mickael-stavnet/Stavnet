import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { forwardAdminRequest, hasAdminSession } from "@/lib/admin-api";
import { resolveBookCoverSrc } from "@/lib/book-images";
import { contentLengthExceeded, errorResponse, isSameOriginMutation } from "@/lib/security";

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function bookImageSrc(item: Record<string, unknown>): string | null {
  const imageKey = readText(item.imageKey);
  if (imageKey) return imageKey;
  const payload = typeof item.payload === "object" && item.payload !== null ? item.payload as Record<string, unknown> : {};
  const uploadedImage = readText(payload["Image. URL"]);
  if (uploadedImage) return uploadedImage;
  const title = readText(payload.Titre);
  const language = readText(payload.Langue);
  const cover = resolveBookCoverSrc(`${title.split(/[—–]/)[0]?.trim() ?? title} ${language}`, `${title} ${language}`, title);
  return cover === "/images/books-cover/book-cover-placeholder.png" ? null : cover;
}

function itemImageSrc(item: Record<string, unknown>, entityType: string): string | null {
  if (entityType === "books") return bookImageSrc(item);
  const payload = typeof item.payload === "object" && item.payload !== null ? item.payload as Record<string, unknown> : {};
  return readText(item.imageKey) || readText(payload["Image. URL"]) || null;
}

function withImageSources(value: unknown, entityType: string): unknown {
  if (typeof value !== "object" || value === null || !("items" in value) || !Array.isArray(value.items)) return value;
  return { ...value, items: value.items.map((item) => { if (typeof item !== "object" || item === null) return item; const record = item as Record<string, unknown>; return { ...record, imageSrc: itemImageSrc(record, entityType) }; }) };
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  if (request.method !== "GET" && (!isSameOriginMutation(request) || contentLengthExceeded(request))) {
    return errorResponse(contentLengthExceeded(request) ? 413 : 400, contentLengthExceeded(request) ? "Requête trop volumineuse." : "Origine de requête invalide.");
  }
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const response = await forwardAdminRequest(request, `/v1/admin/${path.map(encodeURIComponent).join("/")}${requestUrl.search}`);
  if (request.method !== "GET" && response.ok) {
    revalidateTag("books", { expire: 0 });
    ["en", "fr", "he", "ar", "de", "es"].forEach((locale) => {
      revalidatePath(`/${locale}/books`);
      revalidatePath(`/${locale}/persons`);
      revalidatePath(`/${locale}/orgs`);
      revalidatePath(`/${locale}/search`);
    });
  }
  if (request.method !== "GET" || path.length !== 1 || !response.ok) return response;
  const payload: unknown = await response.json().catch(() => null);
  if (["books", "persons", "organizations"].includes(path[0] ?? "")) return NextResponse.json(withImageSources(payload, path[0] ?? ""), { status: response.status });
  if (path[0] !== "search" || typeof payload !== "object" || payload === null) return NextResponse.json(payload, { status: response.status });
  const results = payload as Record<string, unknown>;
  return NextResponse.json({ ...results, books: withImageSources(results.books, "books"), persons: withImageSources(results.persons, "persons"), organizations: withImageSources(results.organizations, "organizations") }, { status: response.status });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
