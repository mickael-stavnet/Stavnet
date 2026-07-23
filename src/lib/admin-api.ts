import "server-only";

import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import type { NextRequest } from "next/server";

export function hasAdminSession(request: NextRequest): boolean {
  return isValidAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function forwardAdminRequest(request: NextRequest, path: string): Promise<Response> {
  const workerUrl = process.env.STAVNET_DATA_WORKER_URL;
  const workerSecret = process.env.STAVNET_DATA_WORKER_SECRET;
  if (!workerUrl || !workerSecret) {
    return Response.json({ error: "Configuration de données indisponible" }, { status: 500 });
  }
  const target = new URL(path, workerUrl);
  const contentType = request.headers.get("content-type");
  const body = request.method === "GET" || request.method === "DELETE" ? undefined : await request.text();
  const response = await fetch(target, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${workerSecret}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body,
    cache: "no-store",
  });
  return new Response(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}
