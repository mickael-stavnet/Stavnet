import type { ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";
import { cacheData } from "@/lib/data/cache";
import { d1Client } from "@/lib/d1-client";
import type { DetailStatistics, StatisticsDistributionItem, StatisticsSeriesPoint } from "@/lib/detail-statistics";

export interface ExplorerStatisticsFilters {
  type: ComparisonType;
  fromYear?: string;
  toYear?: string;
  language?: string;
  country?: string;
  role?: string;
}

export interface ExplorerStatisticsResult {
  type: ComparisonType;
  totalRecords: number;
  primaryCount: number;
  secondaryCount: number;
  statistics: DetailStatistics;
  coverage: { timeline: number; languages: number; countries: number; roles: number };
  filterOptions: { languages: string[]; countries: string[]; roles: string[] };
}

interface ExplorerStatisticsRpc {
  entityType?: unknown;
  totalRecords?: unknown;
  primaryCount?: unknown;
  secondaryCount?: unknown;
  timeline?: unknown;
  languages?: unknown;
  countries?: unknown;
  roles?: unknown;
  filterOptions?: Partial<Record<"languages" | "countries" | "roles", unknown>>;
  coverage?: Partial<Record<"timeline" | "languages" | "countries" | "roles", unknown>>;
}

function readNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function readDistribution(value: unknown): StatisticsDistributionItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const row = entry as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return label ? [{ label, value: readNumber(row.value) }] : [];
  });
}

function readTimeline(value: unknown): StatisticsSeriesPoint[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const row = entry as Record<string, unknown>;
    const period = typeof row.period === "string" ? row.period.trim() : "";
    return period ? [{ period, primary: readNumber(row.primary), secondary: readNumber(row.secondary) }] : [];
  });
}

function readType(value: unknown): ComparisonType {
  return value === "persons" || value === "organizations" ? value : "books";
}

function readOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

const getExplorerStatisticsCached = cacheData(
  ["statistics-explorer"],
  async (filters: ExplorerStatisticsFilters): Promise<ExplorerStatisticsResult> => {
    const { data, error } = await d1Client.rpc<ExplorerStatisticsRpc>("get_statistics_explorer", {
      p_entity_type: filters.type,
      p_year_from: filters.fromYear?.trim() || null,
      p_year_to: filters.toYear?.trim() || null,
      p_language: filters.language?.trim() || null,
      p_country: filters.country?.trim() || null,
      p_role: filters.role?.trim() || null,
    });

    if (error) throw new Error(error.message);

    return {
      type: readType(data?.entityType),
      totalRecords: readNumber(data?.totalRecords),
      primaryCount: readNumber(data?.primaryCount),
      secondaryCount: readNumber(data?.secondaryCount),
      statistics: {
        timeline: readTimeline(data?.timeline),
        timelineHasMonthlyDates: false,
        primaryDistribution: readDistribution(data?.languages),
        secondaryDistribution: readDistribution(data?.countries),
        tertiaryDistribution: readDistribution(data?.roles),
      },
      coverage: {
        timeline: readNumber(data?.coverage?.timeline),
        languages: readNumber(data?.coverage?.languages),
        countries: readNumber(data?.coverage?.countries),
        roles: readNumber(data?.coverage?.roles),
      },
      filterOptions: {
        languages: readOptions(data?.filterOptions?.languages),
        countries: readOptions(data?.filterOptions?.countries),
        roles: readOptions(data?.filterOptions?.roles),
      },
    };
  },
  { revalidate: 300, tags: ["books", "persons", "organizations"] },
);

export async function getExplorerStatistics(filters: ExplorerStatisticsFilters): Promise<ExplorerStatisticsResult> {
  return getExplorerStatisticsCached(filters);
}
