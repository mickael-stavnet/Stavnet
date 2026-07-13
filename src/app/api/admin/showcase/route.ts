import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import {
  getAdminShowcaseSelection,
  saveAdminShowcaseSelection,
} from "@/lib/star-showcase";

function isAdmin(request: NextRequest): boolean {
  return isValidAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return unauthorized();
  }

  try {
    const entries = await getAdminShowcaseSelection();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[StarShowcase] admin selection read failed", error);
    return NextResponse.json({ error: "Unable to read showcase configuration" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const names = body?.names;
  if (!Array.isArray(names)) {
    return NextResponse.json({ error: "names must be an array" }, { status: 400 });
  }

  try {
    const entries = await saveAdminShowcaseSelection(names);
    console.info("[StarShowcase] admin selection saved", { count: entries.length });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[StarShowcase] admin selection save failed", error);
    return NextResponse.json({ error: "Unable to save showcase configuration" }, { status: 500 });
  }
}
