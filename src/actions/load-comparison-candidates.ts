"use server";

import type { ComparisonCandidate, ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";
import { getBooksPage } from "@/lib/data/books";
import { getOrganizationsPage } from "@/lib/data/orgs";
import { getPersonsPage } from "@/lib/data/persons";

const COMPARISON_CANDIDATES_PAGE_SIZE = 25;

export interface ComparisonCandidatePage {
  items: ComparisonCandidate[];
  page: number;
  total: number;
  totalPages: number;
}

function isComparisonType(value: string): value is ComparisonType {
  return value === "books" || value === "persons" || value === "organizations";
}

export async function loadComparisonCandidatesPageAction(type: string, page: number): Promise<ComparisonCandidatePage> {
  if (!isComparisonType(type) || !Number.isSafeInteger(page) || page < 1 || page > 10_000) {
    throw new Error("Invalid comparison page request");
  }

  if (type === "books") {
    const result = await getBooksPage(page, COMPARISON_CANDIDATES_PAGE_SIZE);
    return { items: result.items.map((item) => ({ id: item.id, label: item.title })), page: result.page, total: result.total, totalPages: result.totalPages };
  }

  if (type === "persons") {
    const result = await getPersonsPage(page, COMPARISON_CANDIDATES_PAGE_SIZE);
    return { items: result.items.map((item) => ({ id: item.name, label: item.name })), page: result.page, total: result.total, totalPages: result.totalPages };
  }

  const result = await getOrganizationsPage(page, COMPARISON_CANDIDATES_PAGE_SIZE);
  return { items: result.items.map((item) => ({ id: item.name, label: item.name })), page: result.page, total: result.total, totalPages: result.totalPages };
}
