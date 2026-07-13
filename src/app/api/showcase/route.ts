import { NextResponse } from "next/server";
import { getShowcaseSelection } from "@/lib/star-showcase";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const selection = await getShowcaseSelection();
  return NextResponse.json(selection, {
    headers: { "Cache-Control": "no-store" },
  });
}
