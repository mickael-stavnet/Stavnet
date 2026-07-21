export type StatisticsGranularity = "year" | "decade" | "month";

export interface StatisticsSeriesPoint {
  period: string;
  primary: number;
  secondary: number;
}

export interface StatisticsDistributionItem {
  label: string;
  value: number;
}

export interface DetailStatistics {
  timeline: StatisticsSeriesPoint[];
  timelineHasMonthlyDates: boolean;
  primaryDistribution: StatisticsDistributionItem[];
  secondaryDistribution: StatisticsDistributionItem[];
  tertiaryDistribution: StatisticsDistributionItem[];
}

interface StatisticsSourceRow {
  year: string;
  primary?: boolean;
  language?: string;
  country?: string;
  role?: string;
}

function readYear(value: string): number | null {
  const match = value.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function buildDistribution(values: string[]): StatisticsDistributionItem[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = value.trim();
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 8);
}

export function buildDetailStatistics(rows: StatisticsSourceRow[]): DetailStatistics {
  const periods = new Map<number, { primary: number; secondary: number }>();
  const languages: string[] = [];
  const countries: string[] = [];
  const roles: string[] = [];

  for (const row of rows) {
    const year = readYear(row.year);
    if (year !== null) {
      const current = periods.get(year) ?? { primary: 0, secondary: 0 };
      if (row.primary) current.primary += 1;
      else current.secondary += 1;
      periods.set(year, current);
    }
    if (row.language) languages.push(row.language);
    if (row.country) countries.push(row.country);
    if (row.role) roles.push(row.role);
  }

  return {
    timeline: [...periods.entries()]
      .sort(([left], [right]) => left - right)
      .map(([year, value]) => ({ period: String(year), ...value })),
    timelineHasMonthlyDates: rows.some((row) => /\b\d{1,2}[/.\-]\d{1,2}[/.\-](?:1[5-9]\d{2}|20\d{2})\b/.test(row.year)),
    primaryDistribution: buildDistribution(languages),
    secondaryDistribution: buildDistribution(countries),
    tertiaryDistribution: buildDistribution(roles),
  };
}
