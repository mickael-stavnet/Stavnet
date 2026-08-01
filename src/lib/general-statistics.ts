import { cacheData } from "@/lib/data/cache";
import { d1Client } from "@/lib/d1-client";

export interface GeneralRankingEntry {
  label: string;
  value: number;
}

export interface LanguageBreakdownEntry {
  label: string;
  originals: number;
  translations: number;
}

export interface GeneralStatisticsResult {
  timeline: Array<{ period: string; originals: number; translations: number }>;
  languageBreakdown: LanguageBreakdownEntry[];
  writingGenres: GeneralRankingEntry[];
  birthCountries: GeneralRankingEntry[];
  languageOptions: string[];
  countryOptions: string[];
  publisherOptions: string[];
  yearOptions: number[];
  rankings: {
    originalAuthors: GeneralRankingEntry[];
    originalBooks: GeneralRankingEntry[];
    translatedBooks: GeneralRankingEntry[];
    translatedAuthors: GeneralRankingEntry[];
    originalPublishers: GeneralRankingEntry[];
    translators: GeneralRankingEntry[];
    translationPublishers: GeneralRankingEntry[];
    pocketReissues: GeneralRankingEntry[];
    publicationLanguages: GeneralRankingEntry[];
    publicationCountries: GeneralRankingEntry[];
  };
}

interface GeneralStatisticsRpc {
  timeline?: unknown;
  languageBreakdown?: unknown;
  writingGenres?: unknown;
  birthCountries?: unknown;
  languageOptions?: unknown;
  countryOptions?: unknown;
  publisherOptions?: unknown;
  yearOptions?: unknown;
  rankings?: Partial<Record<keyof GeneralStatisticsResult["rankings"], unknown>>;
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function ranking(value: unknown): GeneralRankingEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return label ? [{ label, value: number(row.value) }] : [];
  });
}

function timeline(value: unknown): GeneralStatisticsResult["timeline"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const period = typeof row.period === "string" ? row.period : "";
    const year = Number(period);
    return Number.isSafeInteger(year) && year >= 1500 && year <= 2099 ? [{ period, originals: number(row.originals), translations: number(row.translations) }] : [];
  });
}

function languageBreakdown(value: unknown): LanguageBreakdownEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return label ? [{ label, originals: number(row.originals), translations: number(row.translations) }] : [];
  });
}

function options(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0) : [];
}

function years(value: unknown): number[] {
  return Array.isArray(value) ? value.flatMap((entry) => {
    const year = Number(entry);
    return Number.isSafeInteger(year) && year >= 1500 && year <= 2099 ? [year] : [];
  }) : [];
}

export interface GeneralStatisticsFilters {
  fromYear?: number;
  toYear?: number;
  language?: string;
  country?: string;
  publisher?: string;
}

const emptyRankings: GeneralStatisticsResult["rankings"] = {
  originalAuthors: [], originalBooks: [], translatedBooks: [], translatedAuthors: [], originalPublishers: [], translators: [], translationPublishers: [], pocketReissues: [], publicationLanguages: [], publicationCountries: [],
};

const getGeneralStatisticsCached = cacheData(
  ["general-statistics-v6"],
  async (filters: GeneralStatisticsFilters): Promise<GeneralStatisticsResult> => {
    const { data, error } = await d1Client.rpc<GeneralStatisticsRpc>("get_general_statistics", {
      p_from_year: filters.fromYear || null,
      p_to_year: filters.toYear || null,
      p_language: filters.language || null,
      p_country: filters.country || null,
      p_publisher: filters.publisher || null,
    });
    if (error) throw new Error(error.message);
    const source = data?.rankings;
    return {
      timeline: timeline(data?.timeline),
      languageBreakdown: languageBreakdown(data?.languageBreakdown),
      writingGenres: ranking(data?.writingGenres),
      birthCountries: ranking(data?.birthCountries),
      languageOptions: options(data?.languageOptions),
      countryOptions: options(data?.countryOptions),
      publisherOptions: options(data?.publisherOptions),
      yearOptions: years(data?.yearOptions),
      rankings: {
        originalAuthors: ranking(source?.originalAuthors),
        originalBooks: ranking(source?.originalBooks),
        translatedBooks: ranking(source?.translatedBooks),
        translatedAuthors: ranking(source?.translatedAuthors),
        originalPublishers: ranking(source?.originalPublishers),
        translators: ranking(source?.translators),
        translationPublishers: ranking(source?.translationPublishers),
        pocketReissues: ranking(source?.pocketReissues),
        publicationLanguages: ranking(source?.publicationLanguages),
        publicationCountries: ranking(source?.publicationCountries),
      },
    };
  },
  { revalidate: 300, tags: ["books", "persons", "organizations"] },
);

export async function getGeneralStatistics(filters: GeneralStatisticsFilters = {}): Promise<GeneralStatisticsResult> {
  return getGeneralStatisticsCached({
    fromYear: filters.fromYear,
    toYear: filters.toYear,
    language: filters.language?.trim(),
    country: filters.country?.trim(),
    publisher: filters.publisher?.trim(),
  });
}

export const emptyGeneralStatistics: GeneralStatisticsResult = { timeline: [], languageBreakdown: [], writingGenres: [], birthCountries: [], languageOptions: [], countryOptions: [], publisherOptions: [], yearOptions: [], rankings: emptyRankings };
