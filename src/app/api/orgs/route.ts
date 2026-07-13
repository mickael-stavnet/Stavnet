import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultOrganizationDetail,
  getOrganizationDetailByName,
  getOrganizationsPageByCategory,
  getOrganizationsPageByName,
  getOrganizationsPageByType,
  getOrganizationsPage,
  ORGS_PAGE_SIZE,
} from "@/lib/data/orgs";
import { MAX_ORGANIZATIONS_PAGE } from "@/lib/pagination";
import { logError, logInfo } from "@/lib/server-log";

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parsePageSize(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    logInfo("API_ORGS_GET_START", {
      method: request.method,
      url: request.url,
      query: Object.fromEntries(searchParams.entries()),
      body: null,
    });

    if (name) {
      const data = await getOrganizationDetailByName(name);
      logInfo("API_ORGS_GET_DONE", {
        mode: "detail",
        responseStatus: 200,
        responseBody: { data },
      });
      return NextResponse.json({ data });
    }

    if (searchParams.get("default") === "true") {
      const data = await getDefaultOrganizationDetail();
      logInfo("API_ORGS_GET_DONE", {
        mode: "default-detail",
        responseStatus: 200,
        responseBody: { data },
      });
      return NextResponse.json({ data });
    }

    const page = parsePage(searchParams.get("page"));
    const pageSize = parsePageSize(searchParams.get("pageSize"), ORGS_PAGE_SIZE);

    if (page > MAX_ORGANIZATIONS_PAGE) {
      return NextResponse.json({ error: "Page out of range" }, { status: 400 });
    }

    const type = searchParams.get("type")?.trim() ?? "";
    const q = searchParams.get("q")?.trim() ?? "";
    const result = type === "Editeur" || type === "Bibliothèque" || type === "AutreOrganisme"
      ? await getOrganizationsPageByCategory(page, type, q, pageSize)
      : type
        ? await getOrganizationsPageByType(page, type, q, pageSize)
        : q
          ? await getOrganizationsPageByName(page, q, pageSize)
          : await getOrganizationsPage(page, pageSize);

    const responseBody = {
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
      stats: {
        cardsFound: result.total,
        databaseContains: result.total,
      },
    };
    logInfo("API_ORGS_GET_DONE", {
      mode: "list",
      responseStatus: 200,
      responseBody,
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logError("API_ORGS_GET_ERROR", {
      method: request.method,
      url: request.url,
      error,
      responseStatus: 500,
      responseBody: { error: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
