import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { fixEncoding } from "@/lib/encoding";
import { logError, logInfo, logWarn } from "@/lib/server-log";

const ORGS_TABLE = "data-organism";

export const ORGS_PAGE_SIZE = 13;

type DatabaseRow = Record<string, string | number | null>;

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
}

function readValue(row: DatabaseRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim().length > 0) {
      return fixEncoding(value).trim();
    }
  }
  return "";
}

function readCount(row: DatabaseRow, keys: string[]): string {
  const value = readValue(row, keys);
  return value || "0";
}

function mapOrganizationListItem(row: DatabaseRow): OrganizationListItem {
  return {
    name: readValue(row, ["Organisme"]),
    type: readValue(row, ["Type"]),
    creationDate: readValue(row, ["Date_Creation"]),
    country: readValue(row, ["Pays"]),
    publishedTitles: readCount(row, ["Nb_Titres"]),
    publishedAuthors: readCount(row, ["Nb_Auteurs"]),
  };
}

function mapOrganizationDetail(row: DatabaseRow, total: number): OrganizationDetail {
  return {
    name: readValue(row, ["Organisme"]),
    synonym: readValue(row, ["Organisme"]),
    type: readValue(row, ["Type"]),
    creationDate: readValue(row, ["Date_Creation"]),
    country: readValue(row, ["Pays"]),
    publishedStats: {
      titles: readCount(row, ["Nb_Titres"]),
      authors: readCount(row, ["Nb_Auteurs"]),
    },
    stats: {
      cardsFound: "1",
      databaseContains: String(total),
    },
  };
}

async function getOrganizationsTotal(): Promise<number> {
  logInfo("ORGS_DB_TOTAL_START", {
    table: ORGS_TABLE,
    action: "count",
  });
  const { count, error, status, statusText } = await supabase
    .from(ORGS_TABLE)
    .select("*", { count: "exact", head: true });

  if (error) {
    logError("ORGS_DB_TOTAL_ERROR", {
      table: ORGS_TABLE,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  logInfo("ORGS_DB_TOTAL_DONE", {
    table: ORGS_TABLE,
    status,
    statusText,
    count,
  });
  return count ?? 0;
}

export async function getOrganizationsPage(
  page: number,
  pageSize = ORGS_PAGE_SIZE,
): Promise<OrganizationListResult> {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  logInfo("ORGS_DB_PAGE_START", {
    table: ORGS_TABLE,
    page: currentPage,
    pageSize,
    range: { from, to },
    orderBy: "Organisme",
  });

  const [{ data, error, status, statusText }, total] = await Promise.all([
    supabase
      .from(ORGS_TABLE)
      .select("*")
      .order("Organisme", { ascending: true })
      .range(from, to),
    getOrganizationsTotal(),
  ]);

  if (error) {
    logError("ORGS_DB_PAGE_ERROR", {
      table: ORGS_TABLE,
      page: currentPage,
      pageSize,
      range: { from, to },
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const rows = (data ?? []) as DatabaseRow[];
  logInfo("ORGS_DB_PAGE_RAW", {
    table: ORGS_TABLE,
    status,
    statusText,
    rowCount: rows.length,
    sampleRow: rows[0] ?? null,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: rows.map(mapOrganizationListItem),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  };
}

export const getOrganizationDetailByName = cache(async (name: string): Promise<OrganizationDetail | null> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    logWarn("ORGS_DB_DETAIL_EMPTY_NAME", { rawName: name });
    return null;
  }
  logInfo("ORGS_DB_DETAIL_START", {
    table: ORGS_TABLE,
    filter: {
      column: "Organisme",
      value: trimmedName,
    },
  });

  const [{ data, error, status, statusText }, total] = await Promise.all([
    supabase
      .from(ORGS_TABLE)
      .select("*")
      .eq("Organisme", trimmedName)
      .limit(1)
      .maybeSingle(),
    getOrganizationsTotal(),
  ]);

  if (error) {
    logError("ORGS_DB_DETAIL_ERROR", {
      table: ORGS_TABLE,
      status,
      statusText,
      filter: {
        column: "Organisme",
        value: trimmedName,
      },
      error,
    });
    throw new Error(error.message);
  }

  if (!data) {
    logWarn("ORGS_DB_DETAIL_NOT_FOUND", {
      table: ORGS_TABLE,
      filter: {
        column: "Organisme",
        value: trimmedName,
      },
      status,
      statusText,
    });
    return null;
  }

  logInfo("ORGS_DB_DETAIL_RAW", {
    table: ORGS_TABLE,
    status,
    statusText,
    row: data,
  });
  return mapOrganizationDetail(data as DatabaseRow, total);
});

export const getDefaultOrganizationDetail = cache(async (): Promise<OrganizationDetail | null> => {
  logInfo("ORGS_DB_DEFAULT_DETAIL_START", {
    table: ORGS_TABLE,
    orderBy: "Organisme",
  });
  const [{ data, error, status, statusText }, total] = await Promise.all([
    supabase
      .from(ORGS_TABLE)
      .select("*")
      .order("Organisme", { ascending: true })
      .limit(1)
      .maybeSingle(),
    getOrganizationsTotal(),
  ]);

  if (error) {
    logError("ORGS_DB_DEFAULT_DETAIL_ERROR", {
      table: ORGS_TABLE,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  if (!data) {
    logWarn("ORGS_DB_DEFAULT_DETAIL_EMPTY", {
      table: ORGS_TABLE,
      status,
      statusText,
    });
    return null;
  }

  logInfo("ORGS_DB_DEFAULT_DETAIL_RAW", {
    table: ORGS_TABLE,
    status,
    statusText,
    row: data,
  });
  return mapOrganizationDetail(data as DatabaseRow, total);
});
