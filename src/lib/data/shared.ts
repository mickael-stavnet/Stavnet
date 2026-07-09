import { fixEncoding } from "@/lib/encoding";
import { supabase } from "@/lib/supabase";

export type DataRow = Record<string, unknown>;

export function readText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return fixEncoding(String(value)).trim();
}

export function readCount(value: unknown): string {
  const text = readText(value);
  return text || "0";
}

export function readNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function normalizeValue(value: string): string {
  return readText(value).toLocaleLowerCase();
}

export function joinName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter((part) => part.length > 0).join(" ");
}

export function readSourceField(row: DataRow, candidates: string[]): string {
  for (const candidate of candidates) {
    if (candidate in row) {
      return readText(row[candidate]);
    }
  }

  return "";
}

export async function fetchAllRows(
  table: string,
  select: string,
  batchSize = 1000,
): Promise<DataRow[]> {
  const rows: DataRow[] = [];
  let from = 0;

  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const batch = Array.isArray(data) ? (data as unknown as DataRow[]) : [];
    rows.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  return rows;
}
