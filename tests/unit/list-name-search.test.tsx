// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LIST_NAME_SEARCH_DEBOUNCE_MS, ListNameSearch } from "@/components/stavnet/list-name-search";

const routerMock = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("page=2&q=old"),
}));

vi.mock("@/i18n/routing", () => ({
  usePathname: () => "/fr/books",
  useRouter: () => routerMock,
}));

describe("ListNameSearch", () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  beforeEach(() => {
    routerMock.replace.mockReset();
  });

  it("replaces the search query on submit and resets to page 1", () => {
    render(
      <ListNameSearch
        label="Search"
        placeholder="Search books"
        initialValue="old"
        resetLabel="Reset"
      />,
    );

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "new title" } });
    fireEvent.submit(screen.getByLabelText("Search").closest("form") as HTMLFormElement);

    expect(routerMock.replace).toHaveBeenCalledWith("/fr/books?page=1&q=new+title");
  });

  it("clears the query and keeps page 1 when reset is clicked", () => {
    render(
      <ListNameSearch
        label="Search"
        placeholder="Search books"
        initialValue="old"
        resetLabel="Reset"
      />,
    );

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "new title" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Reset" })[0]);

    expect(routerMock.replace).toHaveBeenCalledWith("/fr/books?page=1");
  });

  it("waits 900 milliseconds after the last keystroke before searching", () => {
    vi.useFakeTimers();

    render(
      <ListNameSearch
        label="Search"
        placeholder="Search books"
        initialValue="old"
        resetLabel="Reset"
      />,
    );

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "new title" } });

    act(() => {
      vi.advanceTimersByTime(LIST_NAME_SEARCH_DEBOUNCE_MS - 1);
    });
    expect(routerMock.replace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(routerMock.replace).toHaveBeenCalledWith("/fr/books?page=1&q=new+title");
  });
});
