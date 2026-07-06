// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SearchPageClient from "@/app/[locale]/search/search-page-client";

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  useRouter: () => routerMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      "header.cardTitle": "Search",
      "header.title": "Advanced search",
      "header.subtitle": "Find books",
      "info.modeLine1": "Mode",
      "info.modeLine2": "search",
      "info.otherAlphabetLine1": "Other",
      "info.otherAlphabetLine2": "alphabets",
      "info.otherAlphabetLine3": "available",
      "actions.otherAlphabets": "Other alphabets",
      "labels.publicationLanguage": "Publication language",
      "info.languageLine3": "Language",
      "info.languageLine4": "filters",
      "info.languageLine5": "available",
      "labels.theme": "Theme",
      "info.themeLine3": "Theme",
      "info.themeLine4": "filters",
      "labels.title": "Title",
      "labels.personDescription": "Person",
      "labels.lastName": "Last name",
      "labels.firstName": "First name",
      "labels.organizationDescription": "Organization",
      "labels.year": "Year",
      "labels.generalSearch": "General search",
      "actions.validate": "Validate",
      "footer.back": "Back",
      "footer.menu": "Menu",
      "footer.quit": "Quit",
      "footer.help": "Help",
    };

    return labels[key] ?? key;
  },
}));

vi.mock("@/components/stavnet/header", () => ({
  StavnetHeader: () => <header data-testid="header" />,
}));

vi.mock("@/components/stavnet/footer", () => ({
  StavnetFooter: () => <footer data-testid="footer" />,
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { alt, src } = props as { alt?: string; src?: string };
    return <span data-alt={alt ?? ""} data-src={src ?? ""} />;
  },
}));

describe("SearchPageClient", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    routerMock.push.mockReset();
  });

  it("redirects to /books with trimmed filters and page reset", () => {
    render(<SearchPageClient />);

    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), { target: { value: "  Judas  " } });
    fireEvent.change(screen.getByRole("textbox", { name: "Organization" }), { target: { value: "  Gallimard  " } });
    fireEvent.change(screen.getByRole("textbox", { name: "General search" }), {
      target: { value: "  Israeli literature  " },
    });
    fireEvent.submit(screen.getAllByRole("button", { name: "Validate" })[0].closest("form") as HTMLFormElement);

    expect(routerMock.push).toHaveBeenCalledWith(
      "/books?title=Judas&organization=Gallimard&generalSearch=Israeli+literature&page=1",
    );
  });

  it("omits empty filters from the query string", () => {
    render(<SearchPageClient />);

    fireEvent.change(document.getElementById("search-year") as HTMLInputElement, {
      target: { value: " 1980 " },
    });
    fireEvent.submit(screen.getAllByRole("button", { name: "Validate" })[0].closest("form") as HTMLFormElement);

    expect(routerMock.push).toHaveBeenCalledWith("/books?year=1980&page=1");
  });
});
