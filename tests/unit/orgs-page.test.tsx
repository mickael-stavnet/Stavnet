// @vitest-environment jsdom
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getOrganizationsPageMock = vi.hoisted(() => vi.fn());
const getOrganizationsPageByCategoryMock = vi.hoisted(() => vi.fn());
const getOrganizationsPageByNameMock = vi.hoisted(() => vi.fn());
const getOrganizationsPageByTypeMock = vi.hoisted(() => vi.fn());

function serializeHref(href: unknown): string {
  if (typeof href === "string") {
    return href;
  }

  if (!href || typeof href !== "object" || !("pathname" in href)) {
    return "";
  }

  const pathname = String((href as { pathname: string }).pathname);
  const query = (href as { query?: Record<string, string> }).query ?? {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    params.set(key, value);
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string, values?: Record<string, string>) => {
    const labels: Record<string, string> = {
      "header.cardTitle": "Liste organismes",
      "header.title": "Littérature israélienne",
      "header.subtitle": "Base de données bibliographiques et biographiques",
      "search.label": "Recherche par nom",
      "search.placeholder": "Nom de l’organisme...",
      "search.reset": "Réinitialiser",
      "search.noResults": "Aucun organisme trouvé.",
      "filters.title": "Filtrer par type",
      "filters.all": "Tous",
      "filters.options.Editeur": "Editeurs",
      "filters.options.Bibliothèque": "Bibliothèques",
      "filters.options.AutreOrganisme": "Autres organismes",
      "columns.organizations": "Organismes",
      "columns.type": "Type organisme",
      "columns.creationDate": "Date de création",
      "columns.country": "Pays",
      "columns.titlesPublished": "Nb. de titres parus",
      "columns.authorsPublished": "Nb. d’auteur publies",
      "stats.cardsFound": "Fiches organismes",
      "stats.databaseContains": "La base contient",
      "pagination.previous": "Précédent",
      "pagination.next": "Suivant",
      "pagination.results": `Résultats ${values?.start} à ${values?.end} sur ${values?.total}`,
      "footer.back": "Retour",
      "footer.menu": "Menu",
      "footer.close": "Quitter",
      "footer.search": "Rechercher",
      "footer.help": "Aide",
      "footer.move": "Naviguer",
    };

    return labels[key] ?? key;
  },
}));

vi.mock("@/lib/data/orgs", () => ({
  ORGS_PAGE_SIZE: 10,
  getOrganizationsPage: getOrganizationsPageMock,
  getOrganizationsPageByCategory: getOrganizationsPageByCategoryMock,
  getOrganizationsPageByName: getOrganizationsPageByNameMock,
  getOrganizationsPageByType: getOrganizationsPageByTypeMock,
}));

vi.mock("@/components/stavnet/header", () => ({
  StavnetHeader: () => <header data-testid="header" />,
}));

vi.mock("@/components/stavnet/footer", () => ({
  StavnetFooter: () => <footer data-testid="footer" />,
}));

vi.mock("@/components/stavnet/list-name-search", () => ({
  ListNameSearch: ({ label }: { label: string }) => <div data-testid="list-search">{label}</div>,
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: ({ children }: { children: ReactNode }) => <nav>{children}</nav>,
  PaginationContent: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div>,
  PaginationItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PaginationEllipsis: () => <span>…</span>,
  PaginationLink: ({ href, isActive, children }: { href: string; isActive?: boolean; children: ReactNode }) => (
    <a href={href} data-active={isActive ? "true" : "false"}>
      {children}
    </a>
  ),
  PaginationPrevious: ({ href, text }: { href: string; text: string }) => <a href={href}>{text}</a>,
  PaginationNext: ({ href, text }: { href: string; text: string }) => <a href={href}>{text}</a>,
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, className, children }: { href: unknown; className?: string; children: ReactNode }) => (
    <a href={serializeHref(href)} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

vi.mock("@/lib/site-metadata", () => ({
  buildStaticPageMetadata: vi.fn(),
}));

import OrganizationsListPage from "@/app/[locale]/orgs/page";

describe("OrganizationsListPage", () => {
  beforeEach(() => {
    getOrganizationsPageMock.mockReset();
    getOrganizationsPageByCategoryMock.mockReset();
    getOrganizationsPageByNameMock.mockReset();
    getOrganizationsPageByTypeMock.mockReset();
  });

  it("uses the category data path for known type filters and keeps the filter in pagination", async () => {
    getOrganizationsPageByCategoryMock.mockResolvedValueOnce({
      items: [
        {
          name: "Fayard",
          type: "Editeur",
          creationDate: "1857",
          country: "France",
          publishedTitles: "24",
          publishedAuthors: "5",
        },
      ],
      page: 2,
      pageSize: 10,
      total: 24,
      totalPages: 3,
      databaseTotal: 1200,
    });

    const page = await OrganizationsListPage({
      params: Promise.resolve({ locale: "fr" }),
      searchParams: Promise.resolve({ page: "2", q: "Fay", type: "Editeur" }),
    });

    render(page);

    expect(getOrganizationsPageByCategoryMock).toHaveBeenCalledWith(2, "Editeur", "Fay", 10);
    expect(getOrganizationsPageByTypeMock).not.toHaveBeenCalled();

    const activeFilterLink = screen.getByRole("link", { name: "Editeurs" });
    expect(activeFilterLink.className).toContain("bg-[#91d3ea]");
    expect(screen.getByRole("link", { name: "Précédent" })).toHaveAttribute("href", "?page=1&q=Fay&type=Editeur");
    expect(screen.getByRole("link", { name: "Suivant" })).toHaveAttribute("href", "?page=3&q=Fay&type=Editeur");
  });

  it("uses the free type data path for unknown type filters", async () => {
    getOrganizationsPageByTypeMock.mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
      databaseTotal: 1200,
    });

    const page = await OrganizationsListPage({
      params: Promise.resolve({ locale: "fr" }),
      searchParams: Promise.resolve({ page: "1", type: "Diffuseur" }),
    });

    render(page);

    expect(getOrganizationsPageByTypeMock).toHaveBeenCalledWith(1, "Diffuseur", "", 10);
    expect(getOrganizationsPageByCategoryMock).not.toHaveBeenCalled();
  });
});
