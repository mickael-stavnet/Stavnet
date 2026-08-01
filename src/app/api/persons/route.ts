import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultPersonDetail,
  getPersonDetailByName,
  getPersonsPage,
  PERSONS_PAGE_SIZE,
} from "@/lib/data/persons";
import { MAX_PERSONS_PAGE } from "@/lib/pagination";
import { logError, logInfo } from "@/lib/server-log";
import { allowRequest, errorResponse, MAX_PAGE_SIZE, readBoundedPositiveInteger, readBoundedText } from "@/lib/security";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!allowRequest(request, "persons", 120, 60_000)) return errorResponse(429, "Trop de requêtes. Réessayez plus tard.");
    const { searchParams } = new URL(request.url);
    const name = readBoundedText(searchParams.get("name"));
    if (searchParams.has("name") && name === null) return errorResponse(400, "Paramètre name invalide.");
    logInfo("API_PERSONS_GET_START", {
      method: request.method,
      url: request.url,
      query: Object.fromEntries(searchParams.entries()),
      body: null,
    });

    if (name) {
      const data = await getPersonDetailByName(name);
      logInfo("API_PERSONS_GET_DONE", {
        mode: "detail",
        responseStatus: 200,
        responseBody: { data },
      });
      return NextResponse.json({ data });
    }

    if (searchParams.get("default") === "true") {
      const data = await getDefaultPersonDetail();
      logInfo("API_PERSONS_GET_DONE", {
        mode: "default-detail",
        responseStatus: 200,
        responseBody: { data },
      });
      return NextResponse.json({ data });
    }

    const page = readBoundedPositiveInteger(searchParams.get("page"), 1, MAX_PERSONS_PAGE);
    const pageSize = readBoundedPositiveInteger(searchParams.get("pageSize"), PERSONS_PAGE_SIZE, MAX_PAGE_SIZE);

    if (page === null || pageSize === null) return errorResponse(400, "Paramètres de pagination invalides.");

    if (page > MAX_PERSONS_PAGE) {
      return NextResponse.json({ error: "Page out of range" }, { status: 400 });
    }

    const result = await getPersonsPage(page, pageSize);

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
    logInfo("API_PERSONS_GET_DONE", {
      mode: "list",
      responseStatus: 200,
      responseBody,
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    const message = "Impossible de traiter la demande.";
    logError("API_PERSONS_GET_ERROR", {
      method: request.method,
      url: request.url,
      error,
      responseStatus: 500,
      responseBody: { error: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
