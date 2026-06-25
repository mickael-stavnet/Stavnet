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
  databaseTotal: number;
}

const compareByLocaleName = (left: string, right: string): number =>
  left.localeCompare(right, "fr", { sensitivity: "base", ignorePunctuation: true });

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

function isDisplayableOrganizationName(value: string): boolean {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return false;
  }
  return !/^[?\s-]+$/.test(trimmedValue);
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

function mapOrganizationDetail(row: DatabaseRow, filteredTotal: number, databaseTotal: number): OrganizationDetail {
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
      cardsFound: String(filteredTotal),
      databaseContains: String(databaseTotal),
    },
  };
}

function hasOrganizationIdentity(row: DatabaseRow): boolean {
  return isDisplayableOrganizationName(readValue(row, ["Organisme"]));
}

const getAllOrganizationsRows = cache(async (): Promise<DatabaseRow[]> => {
  logInfo("ORGS_DB_ALL_ROWS_START", {
    table: ORGS_TABLE,
    strategy: "plain_select_then_local_sort_and_filter",
  });
  const { data, error, status, statusText } = await supabase
    .from(ORGS_TABLE)
    .select("*")
    .range(0, 5000);

  if (error) {
    logError("ORGS_DB_ALL_ROWS_ERROR", {
      table: ORGS_TABLE,
      status,
      statusText,
      error,
    });
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as DatabaseRow[]).filter(hasOrganizationIdentity);
  logInfo("ORGS_DB_ALL_ROWS_RAW", {
    table: ORGS_TABLE,
    status,
    statusText,
    rowCount: rows.length,
    sampleRow: rows[0] ?? null,
  });
  return rows;
});

const getOrganizationsDatabaseTotal = cache(async (): Promise<number> => {
  logInfo("ORGS_DB_TOTAL_START", {
    table: ORGS_TABLE,
    strategy: "exact_count_head",
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

  const total = count ?? 0;
  logInfo("ORGS_DB_TOTAL_DONE", {
    table: ORGS_TABLE,
    status,
    statusText,
    total,
  });
  return total;
});

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
    orderBy: "local:name",
  });

  const [rows, databaseTotal] = await Promise.all([getAllOrganizationsRows(), getOrganizationsDatabaseTotal()]);
  const sortedRows = rows.slice().sort((left, right) =>
    compareByLocaleName(readValue(left, ["Organisme"]), readValue(right, ["Organisme"])),
  );
  const pagedRows = sortedRows.slice(from, to + 1);
  const total = sortedRows.length;
  logInfo("ORGS_DB_PAGE_LOCAL_RESULT", {
    table: ORGS_TABLE,
    strategy: "local_sort_and_slice",
    totalRows: rows.length,
    pageRowCount: pagedRows.length,
    sampleRow: pagedRows[0] ?? null,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: pagedRows.map(mapOrganizationListItem),
    page: currentPage,
    pageSize,
    total,
    totalPages,
    databaseTotal,
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
      column: "local:name",
      value: trimmedName,
    },
  });

  const [rows, databaseTotal] = await Promise.all([getAllOrganizationsRows(), getOrganizationsDatabaseTotal()]);
  const data = rows.find((row) => readValue(row, ["Organisme"]) === trimmedName) ?? null;

  if (!data) {
    logWarn("ORGS_DB_DETAIL_NOT_FOUND", {
      table: ORGS_TABLE,
      filter: {
        column: "local:name",
        value: trimmedName,
      },
      totalRows: rows.length,
    });
    return null;
  }

  logInfo("ORGS_DB_DETAIL_RAW", {
    table: ORGS_TABLE,
    strategy: "local_lookup",
    row: data,
  });
  return mapOrganizationDetail(data as DatabaseRow, rows.length, databaseTotal);
});

export const getDefaultOrganizationDetail = cache(async (): Promise<OrganizationDetail | null> => {
  logInfo("ORGS_DB_DEFAULT_DETAIL_START", {
    table: ORGS_TABLE,
    orderBy: "local:name",
  });
  const [rows, databaseTotal] = await Promise.all([getAllOrganizationsRows(), getOrganizationsDatabaseTotal()]);
  const data =
    rows
      .slice()
      .sort((left, right) =>
        compareByLocaleName(readValue(left, ["Organisme"]), readValue(right, ["Organisme"])),
      )[0] ?? null;

  if (!data) {
    logWarn("ORGS_DB_DEFAULT_DETAIL_EMPTY", {
      table: ORGS_TABLE,
      totalRows: rows.length,
    });
    return null;
  }

  logInfo("ORGS_DB_DEFAULT_DETAIL_RAW", {
    table: ORGS_TABLE,
    strategy: "local_sort_pick_first",
    row: data,
  });
  return mapOrganizationDetail(data as DatabaseRow, rows.length, databaseTotal);
});
