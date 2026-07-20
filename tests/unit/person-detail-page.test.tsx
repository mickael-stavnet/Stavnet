// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonDetailPage from "@/app/[locale]/persons/person-detail-page";
import { createPersonDetail } from "../helpers/detail-fixtures";

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
      "header.cardTitle": "Fichier personnes",
      "header.title": "Littérature israélienne",
      "header.subtitle": "Base de données bibliographiques et biographiques",
      "footer.back": "Retour",
      "footer.menu": "Menu",
      "footer.close": "Quitter",
      "footer.list": "Liste",
      "footer.search": "Rechercher",
      "footer.help": "Aide",
      "footer.move": "Naviguer",
      "tabs.authorCard": "Fiche auteur",
      "tabs.originalTitles": "Titres originaux",
      "tabs.translatedTitles": "Titres traduits",
      "tabs.authorArticles": "Articles de l'auteur",
      "tabs.authorPublications": "Publications sur l'auteur",
      "tabs.pressCritiques": "Critiques de presse",
      "tabs.awards": "Prix & Distinctions",
      "tabs.statistics": "Statistiques",
      "side.authorCard": "Fiche auteur",
      "fields.person": "Personne : nom, prenom",
      "fields.birth": "Date et lieu de naissance",
      "fields.death": "Date et lieu de décès",
      "fields.activity": "Activité professionnelle",
      "fields.language": "Langue d’écriture",
      "fields.synonyms": "Synonymes",
      "fields.biography": "Biographie en français",
      "bibliography.title": "Bibliographie",
      "bibliography.originalTitles": "Titres originaux",
      "bibliography.translations": "Traductions",
      "bibliography.publicationLanguages": "Langues de publication",
      "bibliography.columns.type": "Orig./Trad.",
      "bibliography.columns.language": "Langues de parution",
      "bibliography.columns.title": "Titres : original ou traduction",
      "bibliography.columns.year": "Année",
      "bibliography.columns.parution": "Parution",
      "bibliography.columns.faconnage": "Façonnage",
      "content.authorArticles": "Articles de l'auteur",
      "content.authorPublications": "Publications sur l'auteur",
      "content.pressCritiques": "Critiques de presse",
      "content.awards": "Prix et distinctions",
      "content.statistics": "Statistiques",
      "right.personCardsFound": "Fiches personnes",
      "right.databaseContains": "La base contient",
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

describe("PersonDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the writing language link as a persons filter", () => {
    render(<PersonDetailPage person={createPersonDetail()} />);

    const languageLink = screen.getByRole("link", { name: "Hébreu" });
    expect(languageLink).toHaveAttribute("href", "/persons?page=1&language=H%C3%A9breu&fallbackFacet=authorWritingLanguage");
  });

  it("shows only original titles in the original titles tab", () => {
    render(<PersonDetailPage person={createPersonDetail()} />);

    fireEvent.click(screen.getByRole("button", { name: "Titres originaux" }));

    expect(screen.getAllByRole("link", { name: "Original Book" }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("link", { name: "Translated Book" })).toHaveLength(0);
    expect(screen.queryByText("Personne : nom, prenom")).not.toBeInTheDocument();
  });

  it("shows only translated titles in the translated titles tab", () => {
    render(<PersonDetailPage person={createPersonDetail()} />);

    fireEvent.click(screen.getByRole("button", { name: "Titres traduits" }));

    expect(screen.getAllByRole("link", { name: "Translated Book" }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("link", { name: "Original Book" })).toHaveLength(0);
    expect(screen.queryByText("Personne : nom, prenom")).not.toBeInTheDocument();
  });

  it("resolves bibliography titles through the by-title route", () => {
    render(<PersonDetailPage person={createPersonDetail()} />);

    const links = screen.getAllByRole("link", { name: "Original Book" });
    expect(links[0]).toHaveAttribute("href", "/books/by-title?title=Original+Book");
  });

  it("shows extracted parution and faconnage values in the bibliography table", () => {
    render(<PersonDetailPage person={createPersonDetail()} />);

    expect(screen.getAllByText("E01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("R").length).toBeGreaterThan(0);
    expect(screen.getByRole("columnheader", { name: "Parution" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Façonnage" })).toBeInTheDocument();
  });
});
