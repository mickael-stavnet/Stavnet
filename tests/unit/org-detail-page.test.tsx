// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OrganizationsDetailPage from "@/app/[locale]/orgs/orgs-detail-page";
import { createOrganizationDetail } from "../helpers/detail-fixtures";

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

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      "header.cardTitle": "Fichier organismes",
      "header.title": "Littérature israélienne",
      "header.subtitle": "Base de données bibliographiques et biographiques",
      "footer.back": "Retour",
      "footer.menu": "Menu",
      "footer.close": "Quitter",
      "footer.list": "Liste",
      "footer.search": "Rechercher",
      "footer.help": "Aide",
      "footer.move": "Naviguer",
      "tabs.editorCard": "Fiche éditeur",
      "tabs.diffuser": "Diffuseur",
      "tabs.distributor": "Distributeur",
      "tabs.salesCounter": "Comptoir de vente",
      "tabs.readingCommittee": "Comité de lecture",
      "tabs.staff": "Personnel",
      "tabs.literaryPrizes": "Prix littéraires",
      "tabs.statistics": "Statistiques",
      "side.editorCard": "Fiche éditeur",
      "side.collections": "Collections",
      "side.creationDate": "Date de création",
      "side.titlesAtCatalog": "Nb. de titres au catalogue",
      "fields.editor": "Editeur",
      "fields.address": "Adresse",
      "fields.postalCode": "Code postal",
      "fields.city": "Ville",
      "fields.country": "Pays",
      "fields.telephone": "Téléphone",
      "fields.fax": "Fax",
      "fields.website": "Site Internet",
      "fields.email": "E-mail",
      "fields.synonyms": "Synonymes",
      "fields.group": "Groupe d’appartenance",
      "published.title": "Ouvrages publiés",
      "published.titlesCount": "Titres",
      "published.authorsCount": "Auteurs",
      "published.columns.titles": "Titres",
      "published.columns.authors": "Auteurs : prénom, nom",
      "published.columns.year": "Année",
      "content.diffuser": "Diffuseur",
      "content.distributor": "Distributeur",
      "content.salesCounter": "Comptoir de vente",
      "content.readingCommittee": "Comité de lecture",
      "content.staff": "Personnel",
      "content.literaryPrizes": "Prix littéraires",
      "content.statistics": "Statistiques",
      "right.organizationCardsFound": "Fiches organismes trouvées",
      "right.databaseContains": "La base contient",
      "noLogoAvailable": "Pas de logo d'organisme disponible",
    };

    return labels[key] ?? key;
  },
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, className, children }: { href: unknown; className?: string; children: ReactNode }) => (
    <a href={serializeHref(href)} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/stavnet/header", () => ({
  StavnetHeader: () => <header data-testid="header" />,
}));

vi.mock("@/components/stavnet/footer", () => ({
  StavnetFooter: () => <footer data-testid="footer" />,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

describe("OrganizationsDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the publisher country as a related books link", () => {
    render(<OrganizationsDetailPage organization={createOrganizationDetail()} />);

    const countryLink = screen.getByRole("link", { name: "France" });
    expect(countryLink).toHaveAttribute("href", "/books/related?facet=publisherCountry&value=France");
  });

  it("renders the organization group link to the orgs list filter", () => {
    render(<OrganizationsDetailPage organization={createOrganizationDetail()} />);

    const typeLink = screen.getByRole("link", { name: "Editeur" });
    expect(typeLink).toHaveAttribute("href", "/orgs?type=Editeur&page=1");
  });

  it("resolves published book titles through the by-title route", () => {
    render(<OrganizationsDetailPage organization={createOrganizationDetail()} />);

    const links = screen.getAllByRole("link", { name: "La Liste" });
    expect(links[0]).toHaveAttribute("href", "/books/by-title?title=La+Liste");
  });

  it("switches tabs and hides the editor card content", () => {
    render(<OrganizationsDetailPage organization={createOrganizationDetail()} />);

    fireEvent.click(screen.getByRole("button", { name: "Diffuseur" }));

    expect(screen.queryAllByRole("link", { name: "La Liste" })).toHaveLength(0);
    expect(screen.getAllByText("Diffuseur").length).toBeGreaterThan(1);
  });
});
