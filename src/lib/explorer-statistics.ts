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
  summary: { periodStart: string; periodEnd: string; peakPeriod: string; peakValue: number; trend: number | null; distinctLanguages: number; distinctCountries: number; distinctRoles: number };
  metricKind: { primary: "originals" | "relatedTitles" | "publishedTitles"; secondary: "translations" | "linkedPeople" | "publishedAuthors" };
  focus: { kind: "publishers" | "organizations" | "authors"; distribution: StatisticsDistributionItem[]; coverage: number };
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
  focus?: unknown;
  summary?: Partial<Record<"periodStart" | "periodEnd" | "peakPeriod" | "peakValue" | "trend" | "distinctLanguages" | "distinctCountries" | "distinctRoles", unknown>>;
  metricKind?: Partial<Record<"primary" | "secondary", unknown>>;
  filterOptions?: Partial<Record<"languages" | "countries" | "roles", unknown>>;
  coverage?: Partial<Record<"timeline" | "languages" | "countries" | "roles" | "focus", unknown>>;
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
    const year = Number(period);
    return period && Number.isSafeInteger(year) && year >= 1500 && year <= 2099 ? [{ period, primary: readNumber(row.primary), secondary: readNumber(row.secondary) }] : [];
  });
}

function readYear(value: unknown): string {
  const year = Number(value);
  return Number.isSafeInteger(year) && year >= 1500 && year <= 2099 ? String(year) : "";
}

function readType(value: unknown): ComparisonType {
  return value === "persons" || value === "organizations" ? value : "books";
}

function readOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function readMetricKind(value: unknown, type: ComparisonType): ExplorerStatisticsResult["metricKind"] {
  const fallback: ExplorerStatisticsResult["metricKind"] = type === "books" ? { primary: "originals", secondary: "translations" } : type === "persons" ? { primary: "relatedTitles", secondary: "linkedPeople" } : { primary: "publishedTitles", secondary: "publishedAuthors" };
  if (typeof value !== "object" || value === null) return fallback;
  const row = value as Record<string, unknown>;
  return {
    primary: row.primary === "relatedTitles" || row.primary === "publishedTitles" ? row.primary : fallback.primary,
    secondary: row.secondary === "linkedPeople" || row.secondary === "publishedAuthors" ? row.secondary : fallback.secondary,
  };
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

    const type = readType(data?.entityType);
    return {
      type,
      totalRecords: readNumber(data?.totalRecords),
      primaryCount: readNumber(data?.primaryCount),
      secondaryCount: readNumber(data?.secondaryCount),
      statistics: {
        timeline: readTimeline(data?.timeline),
        timelineHasMonthlyDates: false,
        primaryDistribution: readDistribution(data?.languages),
        secondaryDistribution: readDistribution(data?.countries),
        tertiaryDistribution: readDistribution(data?.roles),
        quaternaryDistribution: readDistribution(data?.focus),
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
      summary: {
        periodStart: readYear(data?.summary?.periodStart),
        periodEnd: readYear(data?.summary?.periodEnd),
        peakPeriod: readYear(data?.summary?.peakPeriod),
        peakValue: readNumber(data?.summary?.peakValue),
        trend: typeof data?.summary?.trend === "number" && Number.isFinite(data.summary.trend) ? data.summary.trend : null,
        distinctLanguages: readNumber(data?.summary?.distinctLanguages),
        distinctCountries: readNumber(data?.summary?.distinctCountries),
        distinctRoles: readNumber(data?.summary?.distinctRoles),
      },
      metricKind: readMetricKind(data?.metricKind, type),
      focus: {
        kind: type === "books" ? "publishers" : type === "persons" ? "organizations" : "authors",
        distribution: readDistribution(data?.focus),
        coverage: readNumber(data?.coverage?.focus),
      },
    };
  },
  { revalidate: 300, tags: ["books", "persons", "organizations"] },
);

export async function getExplorerStatistics(filters: ExplorerStatisticsFilters): Promise<ExplorerStatisticsResult> {
  return getExplorerStatisticsCached(filters);
}
