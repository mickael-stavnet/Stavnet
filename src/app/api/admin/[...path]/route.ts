import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { forwardAdminRequest, hasAdminSession } from "@/lib/admin-api";
import { resolveBookCoverSrc } from "@/lib/book-images";

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

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const response = await forwardAdminRequest(request, `/v1/admin/${path.map(encodeURIComponent).join("/")}${requestUrl.search}`);
  if (request.method !== "GET" && response.ok) {
    ["en", "fr", "he", "ar", "de", "es"].forEach((locale) => {
      revalidatePath(`/${locale}/books`);
      revalidatePath(`/${locale}/persons`);
      revalidatePath(`/${locale}/orgs`);
      revalidatePath(`/${locale}/search`);
    });
  }
  if (request.method !== "GET" || path.length !== 1 || !["books", "persons", "organizations"].includes(path[0] ?? "") || !response.ok) return response;
  const payload: unknown = await response.json().catch(() => null);
  if (typeof payload !== "object" || payload === null || !("items" in payload) || !Array.isArray(payload.items)) return NextResponse.json(payload, { status: response.status });
  return NextResponse.json({ ...payload, items: payload.items.map((item) => { if (typeof item !== "object" || item === null) return item; const record = item as Record<string, unknown>; const imageSrc = path[0] === "books" ? bookImageSrc(record) : readText(record.imageKey) || readText(typeof record.payload === "object" && record.payload !== null ? (record.payload as Record<string, unknown>)["Image. URL"] : null) || null; return { ...record, imageSrc }; }) }, { status: response.status });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
