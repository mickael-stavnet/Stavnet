// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MouseEventHandler, ReactNode } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";

const routerMock = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { alt, src, ...rest } = props as { alt?: string; src?: string };
    return <span data-alt={alt ?? ""} data-src={src ?? ""} {...rest} />;
  },
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, onClick, className }: {
    href: string;
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

describe("StavnetFooter", () => {
  beforeEach(() => {
    routerMock.back.mockReset();
    routerMock.push.mockReset();
  });

  it("renders footer items", () => {
    render(
      <StavnetFooter
        items={[
          { key: "home", href: "/home", icon: "/icons/home.png", label: "Home" },
          { key: "menu", href: "/menu", icon: "/icons/menu.png", label: "Menu" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
  });
});
