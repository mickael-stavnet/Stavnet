import type { OrganizationCategoryValue } from "@/lib/data/orgs";

export const ORGANIZATION_FILTER_OPTIONS = ["Editeur", "Bibliothèque", "AutreOrganisme"] as const satisfies readonly OrganizationCategoryValue[];

export interface OrganizationsSearchParams {
  page?: string;
  q?: string;
  type?: string;
}

export interface OrganizationsListSelection {
  pageNumber: number;
  searchTerm: string;
  typeFilter: string;
  categoryFilter: OrganizationCategoryValue | "";
  mode: "basic" | "name" | "type" | "category";
}

export function buildOrganizationsPageHref(page: number, searchTerm: string, typeFilter: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page <= 1 ? 1 : page));
  if (searchTerm.trim()) {
    params.set("q", searchTerm);
  }
  if (typeFilter.trim()) {
    params.set("type", typeFilter);
  }
  return `?${params.toString()}`;
}

export function resolveOrganizationsListSelection({
  page,
  q,
  type,
}: OrganizationsSearchParams): OrganizationsListSelection {
  const currentPage = Number.parseInt(page ?? "1", 10);
  const searchTerm = (q ?? "").trim();
  const typeFilter = (type ?? "").trim();
  const categoryFilter = ORGANIZATION_FILTER_OPTIONS.find((value) => value === typeFilter) ?? "";
  const pageNumber = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const mode: OrganizationsListSelection["mode"] = categoryFilter
    ? "category"
    : typeFilter
      ? "type"
      : searchTerm
        ? "name"
        : "basic";

  return {
    pageNumber,
    searchTerm,
    typeFilter,
    categoryFilter,
    mode,
  };
}
