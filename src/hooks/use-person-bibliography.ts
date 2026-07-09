import { useMemo } from "react";
import type { PersonBibliographyRow } from "@/lib/data/persons";

export interface PersonBibliographyDisplayRow extends PersonBibliographyRow {
  parution: string;
  faconnage: string;
}

interface PersonBibliographyCollections {
  bibliographyRows: PersonBibliographyDisplayRow[];
  originalRows: PersonBibliographyDisplayRow[];
  translatedRows: PersonBibliographyDisplayRow[];
}

const PERSON_BIBLIOGRAPHY_TYPE_ORDER: Record<string, number> = {
  original: 0,
  traduction: 1,
};

function normalizeBibliographyValue(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function readYearSortValue(value: string): number {
  const match = value.match(/\d{4}/);

  if (!match) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

export function parsePersonBibliographyIssue(issue: string): {
  parution: string;
  faconnage: string;
} {
  const trimmedIssue = issue.trim();

  if (!trimmedIssue) {
    return {
      parution: "",
      faconnage: "",
    };
  }

  const parts = trimmedIssue
    .split("-")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return {
    parution: parts[4] ?? "",
    faconnage: parts[3] ?? "",
  };
}

function compareBibliographyRows(left: PersonBibliographyDisplayRow, right: PersonBibliographyDisplayRow): number {
  const leftType = normalizeBibliographyValue(left.type);
  const rightType = normalizeBibliographyValue(right.type);
  const leftTypeOrder = PERSON_BIBLIOGRAPHY_TYPE_ORDER[leftType] ?? Number.POSITIVE_INFINITY;
  const rightTypeOrder = PERSON_BIBLIOGRAPHY_TYPE_ORDER[rightType] ?? Number.POSITIVE_INFINITY;

  if (leftTypeOrder !== rightTypeOrder) {
    return leftTypeOrder - rightTypeOrder;
  }

  const leftYear = readYearSortValue(left.year);
  const rightYear = readYearSortValue(right.year);

  if (leftYear !== rightYear) {
    return rightYear - leftYear;
  }

  const titleDiff = left.title.localeCompare(right.title, "fr", { sensitivity: "base" });

  if (titleDiff !== 0) {
    return titleDiff;
  }

  const languageDiff = left.language.localeCompare(right.language, "fr", { sensitivity: "base" });

  if (languageDiff !== 0) {
    return languageDiff;
  }

  const parutionDiff = left.parution.localeCompare(right.parution, "fr", { sensitivity: "base" });

  if (parutionDiff !== 0) {
    return parutionDiff;
  }

  return left.faconnage.localeCompare(right.faconnage, "fr", { sensitivity: "base" });
}

export function enrichPersonBibliographyRows(rows: PersonBibliographyRow[]): PersonBibliographyDisplayRow[] {
  return rows
    .map((row) => {
      const issueDetails = parsePersonBibliographyIssue(row.issue);

      return {
        ...row,
        parution: issueDetails.parution,
        faconnage: issueDetails.faconnage,
      };
    })
    .sort(compareBibliographyRows);
}

export function usePersonBibliography(rows: PersonBibliographyRow[]): PersonBibliographyCollections {
  const bibliographyRows = useMemo(() => enrichPersonBibliographyRows(rows), [rows]);

  const originalRows = useMemo(
    () => bibliographyRows.filter((row) => normalizeBibliographyValue(row.type) === "original"),
    [bibliographyRows],
  );

  const translatedRows = useMemo(
    () => bibliographyRows.filter((row) => normalizeBibliographyValue(row.type) === "traduction"),
    [bibliographyRows],
  );

  return {
    bibliographyRows,
    originalRows,
    translatedRows,
  };
}
