import { NextResponse, type NextRequest } from "next/server";
import { del, put } from "@vercel/blob";
import { hasAdminSession } from "@/lib/admin-api";
import { allowRequest, errorResponse, isEntityType, isSameOriginMutation, isSafeBlobUrl } from "@/lib/security";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function detectedImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return "image/png";
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  if (!isSameOriginMutation(request)) return errorResponse(400, "Origine de requête invalide.");
  if (!allowRequest(request, "admin-media", 20, 60_000)) return errorResponse(429, "Trop de téléversements. Réessayez plus tard.");
  const formData = await request.formData();
  const file = formData.get("file");
  const entityType = formData.get("entityType");
  if (!(file instanceof File) || !isEntityType(entityType)) return errorResponse(400, "Fichier ou entité invalide.");
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return errorResponse(413, "Image de 10 Mo maximum requise.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const imageType = detectedImageType(bytes);
  if (!imageType || imageType !== file.type) return errorResponse(415, "Le contenu du fichier n’est pas une image JPEG, PNG ou WebP valide.");
  const extension = imageType === "image/jpeg" ? "jpg" : imageType === "image/png" ? "png" : "webp";
  const key = `${entityType}/${crypto.randomUUID()}.${extension}`;
  try {
    const blob = await put(key, new Blob([bytes], { type: imageType }), { access: "public", addRandomSuffix: false, contentType: imageType });
    return NextResponse.json({ key: blob.url, pathname: blob.pathname, contentType: imageType });
  } catch {
    return errorResponse(422, "Impossible de traiter cette image.");
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSession(request)) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  if (!isSameOriginMutation(request)) return errorResponse(400, "Origine de requête invalide.");
  const value: unknown = await request.json().catch(() => null);
  const url = typeof value === "object" && value !== null && "url" in value && typeof value.url === "string" ? value.url : "";
  if (!isSafeBlobUrl(url)) return errorResponse(400, "Média invalide.");
  await del(url);
  return NextResponse.json({ ok: true });
}
