import { NextResponse, type NextRequest } from "next/server";
import { del, put } from "@vercel/blob";
import { hasAdminSession } from "@/lib/admin-api";

const ALLOWED_TYPES = new Map<string, string>([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const ENTITY_TYPES = new Set(["books", "persons", "organizations"]);

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  const entityType = formData.get("entityType");
  if (!(file instanceof File) || typeof entityType !== "string" || !ENTITY_TYPES.has(entityType)) return NextResponse.json({ error: "Fichier ou entité invalide" }, { status: 400 });
  const extension = ALLOWED_TYPES.get(file.type);
  if (!extension || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image JPEG, PNG ou WebP de 10 Mo maximum requise" }, { status: 400 });
  const key = `${entityType}/${crypto.randomUUID()}.${extension}`;
  try {
    const blob = await put(key, file, { access: "public", addRandomSuffix: false, contentType: file.type });
    return NextResponse.json({ key: blob.url, pathname: blob.pathname, originalName: file.name, contentType: file.type });
  } catch {
    return NextResponse.json({ error: "Téléversement Vercel Blob impossible" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  const value: unknown = await request.json().catch(() => null);
  const url = typeof value === "object" && value !== null && "url" in value && typeof value.url === "string" ? value.url : "";
  if (!/^https:\/\/[A-Za-z0-9-]+\.public\.blob\.vercel-storage\.com\/(books|persons|organizations)\//.test(url)) return NextResponse.json({ error: "Média invalide" }, { status: 400 });
  await del(url);
  return NextResponse.json({ ok: true });
}
