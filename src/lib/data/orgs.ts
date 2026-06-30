import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { fixEncoding } from "@/lib/encoding";
import { logError, logInfo, logWarn } from "@/lib/server-log";

export const ORGS_PAGE_SIZE = 13;

type OrganizationPageItemRpc = {
  name?: unknown;
  type?: unknown;
  creationDate?: unknown;
  country?: unknown;
  publishedTitles?: unknown;
  publishedAuthors?: unknown;
};

type OrganizationPageRpc = {
  items?: OrganizationPageItemRpc[] | null;
  totalCount?: unknown;
  databaseTotal?: unknown;
} | null;

type OrganizationDetailRpc = {
  name?: unknown;
  synonym?: unknown;
  type?: unknown;
  creationDate?: unknown;
  country?: unknown;
  publishedStats?: {
    titles?: unknown;
    authors?: unknown;
  } | null;
  stats?: {
    cardsFound?: unknown;
    databaseContains?: unknown;
  } | null;
} | null;

export interface OrganizationListItem {
  name: string;
  type: string;
  creationDate: string;
  country: string;
  publishedTitles: string;
  publishedAuthors: string;
}

export interface OrganizationDetail {
  name: string;
  synonym: string;
  type: string;
  creationDate: string;
  country: string;
  publishedStats: {
    titles: string;
    authors: string;
  };
  stats: {
    cardsFound: string;
    databaseContains: string;
  };
}

export interface OrganizationListResult {
  items: OrganizationListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  databaseTotal: number;
}

function readText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return fixEncoding(String(value)).trim();
}

function readCount(value: unknown): string {
  const text = readText(value);
  return text || "0";
}

function readNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapOrganizationListItem(item: OrganizationPageItemRpc): OrganizationListItem {
  return {
    name: readText(item.name),
    type: readText(item.type),
    creationDate: readText(item.creationDate),
    country: readText(item.country),
    publishedTitles: readCount(item.publishedTitles),
    publishedAuthors: readCount(item.publishedAuthors),
  };
}

function mapOrganizationDetail(detail: OrganizationDetailRpc): OrganizationDetail | null {
  if (!detail) {
    return null;
  }

  return {
    name: readText(detail.name),
    synonym: readText(detail.synonym),
    type: readText(detail.type),
    creationDate: readText(detail.creationDate),
    country: readText(detail.country),
    publishedStats: {
      titles: readCount(detail.publishedStats?.titles),
      authors: readCount(detail.publishedStats?.authors),
    },
    stats: {
      cardsFound: readCount(detail.stats?.cardsFound),
      databaseContains: readCount(detail.stats?.databaseContains),
    },
  };
}

function buildOrganizationsListResult(
  payload: OrganizationPageRpc,
  currentPage: number,
  pageSize: number,
): OrganizationListResult {
  const items = Array.isArray(payload?.items) ? payload.items.map(mapOrganizationListItem) : [];
  const total = readNumber(payload?.totalCount);
  const databaseTotal = readNumber(payload?.databaseTotal);

  return {
    items,
    page: currentPage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    databaseTotal,
  };
}

async function fetchOrganizationsPagePayload(
  page: number,
  pageSize: number,
  searchTerm?: string,
): Promise<OrganizationPageRpc> {
  const currentPage = Math.max(1, page);
  const trimmedSearchTerm = searchTerm?.trim() ?? "";

  logInfo("ORGS_RPC_PAGE_START", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
  });

  const { data, error, status, statusText } = await supabase.rpc("get_organizations_page", {
    p_page: currentPage,
    p_page_size: pageSize,
    p_search: trimmedSearchTerm.length > 0 ? trimmedSearchTerm : null,
  });

  if (error) {
    logError("ORGS_RPC_PAGE_ERROR", {
      page: currentPage,
      pageSize,
      searchTerm: trimmedSearchTerm || null,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  logInfo("ORGS_RPC_PAGE_RESULT", {
    page: currentPage,
    pageSize,
    searchTerm: trimmedSearchTerm || null,
    status,
    statusText,
    itemCount: Array.isArray((data as OrganizationPageRpc)?.items)
      ? (data as OrganizationPageRpc)?.items?.length ?? 0
      : 0,
    totalCount: readNumber((data as OrganizationPageRpc)?.totalCount),
    databaseTotal: readNumber((data as OrganizationPageRpc)?.databaseTotal),
  });

  return (data as OrganizationPageRpc) ?? null;
}

export async function getOrganizationsPage(
  page: number,
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const payload = await fetchOrganizationsPagePayload(currentPage, pageSize);
  return buildOrganizationsListResult(payload, currentPage, pageSize);
}

export async function getOrganizationsPageByName(
  page: number,
  searchTerm: string,
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const payload = await fetchOrganizationsPagePayload(currentPage, pageSize, searchTerm);
  return buildOrganizationsListResult(payload, currentPage, pageSize);
}

export const getOrganizationDetailByName = cache(async (name: string): Promise<OrganizationDetail | null> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    logWarn("ORGS_RPC_DETAIL_EMPTY_NAME", { rawName: name });
    return null;
  }

  logInfo("ORGS_RPC_DETAIL_START", {
    name: trimmedName,
  });

  const { data, error, status, statusText } = await supabase.rpc("get_organization_detail_by_name", {
    p_name: trimmedName,
  });

  if (error) {
    logError("ORGS_RPC_DETAIL_ERROR", {
      name: trimmedName,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const detail = mapOrganizationDetail((data as OrganizationDetailRpc) ?? null);

  if (!detail) {
    logWarn("ORGS_RPC_DETAIL_NOT_FOUND", {
      name: trimmedName,
      status,
      statusText,
    });
    return null;
  }

  logInfo("ORGS_RPC_DETAIL_RESULT", {
    name: trimmedName,
    status,
    statusText,
    resolvedName: detail.name,
  });

  return detail;
});

export const getDefaultOrganizationDetail = cache(async (): Promise<OrganizationDetail | null> => {
  logInfo("ORGS_RPC_DEFAULT_DETAIL_START", {});

  const { data, error, status, statusText } = await supabase.rpc("get_default_organization_detail");

  if (error) {
    logError("ORGS_RPC_DEFAULT_DETAIL_ERROR", {
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const detail = mapOrganizationDetail((data as OrganizationDetailRpc) ?? null);

  if (!detail) {
    logWarn("ORGS_RPC_DEFAULT_DETAIL_EMPTY", {
      status,
      statusText,
    });
    return null;
  }

  logInfo("ORGS_RPC_DEFAULT_DETAIL_RESULT", {
    status,
    statusText,
    resolvedName: detail.name,
  });

  return detail;
});
