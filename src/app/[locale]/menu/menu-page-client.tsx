"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";
import { Input } from "@/components/ui/input";

type MenuKey = (typeof menuColumns)[number]["key"];
type AppHref =
  | "/"
  | "/home"
  | "/menu"
  | "/orgs"
  | "/persons"
  | "/search"
  | "/statistics"
  | "/books";

const submenuDestinations: Record<MenuKey, AppHref> = {
  books: "/books",
  persons: "/persons",
  organizations: "/orgs",
};

const DEFAULT_MENU_KEY: MenuKey = "books";

const menuColumns = [
  {
    key: "books",
    icon: "/icons/icons-nav/book.png",
  },
  {
    key: "persons",
    icon: "/icons/icons-nav/personnes.png",
  },
  {
    key: "organizations",
    icon: "/icons/icons-nav/organismes.png",
  },
] as const;

export default function MenuPageClient() {
  const t = useTranslations("MenuPage");
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<MenuKey>(DEFAULT_MENU_KEY);
  const centralSectionRef = useRef<HTMLElement>(null);
  const menuButtonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const submenuItemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const activeIndex = menuColumns.findIndex(
    (column) => column.key === activeMenu,
  );
  const quickActions = [
    ["libraries", "/orgs"],
    ["editions", "/menu"],
    ["bookstores", "/menu"],
    ["statistics", "/statistics"],
  ] as const;
  const footerItems = [
    {
      key: "back",
      icon: "/icons/icons-nav/back.png",
      href: "/home" as const,
      label: t("bottom.back"),
    },
    {
      key: "welcome",
      icon: "/icons/icons-nav/welcome.png",
      href: "/home" as const,
      label: t("bottom.welcome"),
    },
    {
      key: "video",
      icon: "/icons/icons-nav/video.png",
      href: "/menu" as const,
      label: t("bottom.video"),
    },
    {
      key: "diaporama",
      icon: "/icons/icons-nav/diapo.png",
      href: "/menu" as const,
      label: t("bottom.diaporama"),
    },
    {
      key: "sound",
      icon: "/icons/icons-nav/sound.png",
      href: "/menu" as const,
      label: t("bottom.sound"),
    },
    {
      key: "introduction",
      icon: "/icons/icons-nav/introduction.png",
      href: "/menu" as const,
      label: t("bottom.introduction"),
    },
    {
      key: "statistics",
      icon: "/icons/icons-nav/next.png",
      href: "/statistics" as const,
      label: t("bottom.statistics"),
    },
    {
      key: "help",
      icon: "/icons/icons-nav/help.png",
      href: "/menu" as const,
      label: t("bottom.help"),
    },
    {
      key: "close",
      icon: "/icons/icons-nav/close.png",
      href: "/menu" as const,
      label: t("bottom.close"),
    },
  ];
  const submenuIndexes = Array.from({ length: 8 }, (_, index) => index);
  useEffect(() => {
    if (!centralSectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        centralSectionRef.current,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
      );

      gsap.fromTo(
        menuButtonsRef.current.filter(Boolean),
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.15,
        },
      );
    }, centralSectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const buttons = menuButtonsRef.current.filter(Boolean);
    if (!buttons.length) {
      return;
    }

    gsap.to(buttons, {
      y: 0,
      scale: 1,
      duration: 0.22,
      ease: "power2.out",
    });

    const activeButton =
      activeIndex >= 0 ? menuButtonsRef.current[activeIndex] : null;
    if (activeButton) {
      gsap.to(activeButton, {
        y: -6,
        scale: 1.03,
        duration: 0.26,
        ease: "power2.out",
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    const items = submenuItemsRef.current.filter(Boolean);
    if (!items.length) {
      return;
    }

    gsap.fromTo(
      items,
      { autoAlpha: 0, x: -16 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.32,
        stagger: 0.045,
        ease: "power2.out",
      },
    );
  }, [activeMenu]);

  return (
    <>
      <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-[#0c2740] md:h-screen md:overflow-hidden">
        <Image
          src="/background/background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
          <StavnetHeader
            pageName={t("header.cardTitle")}
            title={t("header.title")}
            subtitle={t("header.subtitle")}
            titleClassName="md:text-[35px]"
            subtitleClassName="md:text-[18px]"
          />

          <section
            data-stavnet-animate="menu-content"
            ref={centralSectionRef}
            onMouseLeave={() => setActiveMenu(DEFAULT_MENU_KEY)}
            onBlurCapture={(event) => {
              const currentTarget = event.currentTarget;
              requestAnimationFrame(() => {
                if (!currentTarget.contains(document.activeElement)) {
                  setActiveMenu(DEFAULT_MENU_KEY);
                }
              });
            }}
            onFocusCapture={(event) => {
              const trigger = event.target as HTMLElement | null;
              const menuKey = trigger
                ?.closest("[data-menu-key]")
                ?.getAttribute("data-menu-key");
              if (
                menuKey === "books" ||
                menuKey === "persons" ||
                menuKey === "organizations"
              ) {
                setActiveMenu(menuKey);
              } else {
                setActiveMenu(DEFAULT_MENU_KEY);
              }
            }}
            className="mt-5 flex flex-col gap-5 md:absolute md:left-[11vw] md:right-[11vw] md:top-[258px] md:mt-0 md:h-[600px] md:gap-0 [@media(max-height:950px)]:top-[214px] [@media(max-height:950px)]:origin-top [@media(max-height:950px)]:scale-[0.86]"
          >
            <div className="flex flex-col gap-4 md:absolute md:left-0 md:right-0 md:top-[-56px] md:flex-row md:items-center md:justify-between">
              <div className="max-w-[560px] text-left">
                <p className="text-[18px] font-bold italic leading-[1.12] text-black sm:text-[19px]">
                  <span>{t("intro.leftLine1")}</span>
                  <br />
                  <span>{t("intro.leftLine2")}</span>
                </p>
              </div>

              <div className="flex w-full items-center justify-center self-center md:mr-[0.4vw] md:w-[470px] md:self-auto">
                <div className="w-full text-center md:text-right">
                  <label htmlFor="menu-search-input" className="sr-only">
                    {t("search.label")}
                  </label>
                  <div className="relative">
                    <Input
                      id="menu-search-input"
                      type="search"
                      readOnly
                      value=""
                      placeholder={t("search.placeholder")}
                      onFocus={() => router.push("/search")}
                      onClick={() => router.push("/search")}
                      className="h-[48px] cursor-pointer rounded-[12px] border-[#bdb6a2] bg-[#f3efe0] pr-20 text-[15px] text-[#243d64] placeholder:text-[#6e6b5b] focus-visible:ring-0 sm:pr-28 md:h-[44px]"
                    />
                    <div className="pointer-events-none absolute right-[8px] top-1/2 flex h-[34px] items-center gap-2 rounded-[10px] border border-[#c9c3b4] bg-[#efede7] px-2.5 -translate-y-1/2 text-[#5f6068] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] sm:px-3">
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-[18px] w-[18px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7.25 8.15V5.7a2.2 2.2 0 1 0-2.2 2.2h2.2Zm0 3.7v2.45a2.2 2.2 0 1 1-2.2-2.2h2.2Zm5.5-3.7V5.7a2.2 2.2 0 1 1 2.2 2.2h-2.2Zm0 3.7v2.45a2.2 2.2 0 1 0 2.2-2.2h-2.2ZM8.15 7.25h3.7v5.5h-3.7z" />
                      </svg>
                      <span className="hidden text-[11px] font-bold tracking-[0.12em] text-[#6a6b74] sm:inline">
                        K
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:absolute md:left-0 md:right-0 md:top-[64px] md:grid-cols-3 md:gap-5">
              {menuColumns.map((column, columnIndex) => (
                <article
                  key={column.key}
                  className="min-w-0 rounded-[18px] border border-[#b5c9d2] bg-[rgba(236,247,250,0.82)] p-4 shadow-[0_10px_18px_rgba(53,96,120,0.14)] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none"
                >
                  <button
                    type="button"
                    data-menu-key={column.key}
                    ref={(element) => {
                      menuButtonsRef.current[columnIndex] = element;
                    }}
                    onMouseEnter={() => setActiveMenu(column.key)}
                    onFocus={() => setActiveMenu(column.key)}
                    onClick={() => router.push(submenuDestinations[column.key])}
                    className="flex min-h-[52px] min-w-0 items-start gap-4 text-left will-change-transform md:gap-3"
                  >
                    <Image
                      src={column.icon}
                      alt=""
                      width={74}
                      height={74}
                      className={`h-auto shrink-0 object-contain ${
                        column.key === "persons"
                          ? "relative top-[-18px] w-[74px] md:top-[-20px] md:w-[68px]"
                          : column.key === "organizations"
                            ? "w-[76px] md:w-[68px]"
                            : "w-[70px] md:w-[62px]"
                      }`}
                    />
                    <div className="min-w-0 max-w-[260px] pt-[3px] md:max-w-none md:pt-[2px]">
                      <h2 className="text-[22px] font-bold leading-[1.02] text-[#ff3d00] md:text-[20px] md:leading-none">
                        {t(`columns.${column.key}.title`)}
                      </h2>
                      <p className="mt-[3px] text-[19px] font-bold italic leading-[1.08] text-[#0018c9] md:mt-[2px] md:text-[17px] md:leading-[1.04]">
                        {t(`columns.${column.key}.subtitleLine1`)}
                      </p>
                      <p className="text-[19px] font-bold italic leading-[1.08] text-[#0018c9] md:text-[17px] md:leading-[1.04]">
                        {t(`columns.${column.key}.subtitleLine2`)}
                      </p>
                    </div>
                  </button>

                  <ul className="mt-4 grid gap-2 md:hidden">
                    {submenuIndexes.map((index) => (
                      <li key={`${column.key}-${index}`}>
                        <Link
                          href={submenuDestinations[column.key]}
                          className="flex min-h-[44px] items-center rounded-[10px] border border-[#b8c8cf] bg-[rgba(255,255,255,0.54)] px-3 text-[15px] font-bold leading-[1.1] text-[#233341] transition-colors hover:bg-[rgba(255,255,255,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356985]"
                        >
                          {t(`columns.${column.key}.items.${index}`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <section className="relative hidden overflow-hidden rounded-b-[28px] rounded-tr-[6px] px-6 py-4 shadow-[9px_9px_11px_rgba(0,0,0,0.36)] md:absolute md:left-0 md:right-0 md:top-[152px] md:block md:min-h-[420px] md:px-4 md:py-5">
              <Image
                src="/images/home/home-image-banner.png"
                alt=""
                fill
                priority
                sizes="(max-width: 767px) 100vw, 90vw"
                className="object-fill"
              />
              <div className="absolute inset-0 bg-[#d7eef7]/42" />
              <div className="relative grid gap-7 md:grid-cols-3 md:gap-5">
                {menuColumns.map((column) => (
                  <article key={column.key} className="min-w-0">
                    {activeMenu === column.key ? (
                      <ul className="space-y-[5px] pt-[8px] text-[18px] font-bold leading-none text-[#233341] md:pl-[46px]">
                        {submenuIndexes.map((index) => (
                          <li
                            key={index}
                            ref={(element) => {
                              submenuItemsRef.current[index] = element;
                            }}
                            className="flex items-start"
                          >
                            <Link
                              href={submenuDestinations[column.key]}
                              data-menu-key={column.key}
                              className="group inline-flex items-center gap-2 text-[#233341] transition-all duration-150 hover:translate-x-[3px] hover:text-[#102b58] focus-visible:translate-x-[3px] focus-visible:outline-none"
                            >
                              <span className="border-b border-transparent transition-colors duration-150 group-hover:border-[#102b58]/40 group-focus-visible:border-[#102b58]/40">
                                {t(`columns.${column.key}.items.${index}`)}
                              </span>
                              <span className="text-[12px] text-[#102b58]/0 transition-colors duration-150 group-hover:text-[#102b58]/70 group-focus-visible:text-[#102b58]/70">
                                ›
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <div className="grid gap-3 pt-1 sm:grid-cols-2 md:absolute md:left-0 md:right-0 md:top-[588px] md:grid-cols-4 md:gap-8 md:px-[0.1vw]">
              {quickActions.map(([key, href]) => (
                <Link
                  key={key}
                  href={href}
                  className="flex min-h-[56px] items-center justify-center rounded-bl-[11px] rounded-tr-[4px] bg-[linear-gradient(90deg,#ff6d23_0%,#ffb534_46%,#fff043_100%)] px-4 py-2 text-center text-[18px] font-bold leading-[1.08] text-[#0018c9] shadow-[8px_9px_9px_rgba(0,0,0,0.32)] sm:text-[20px] md:h-[52px] md:min-h-0 md:text-[21px]"
                >
                  {t(`quickActions.${key}`)}
                </Link>
              ))}
            </div>
          </section>

          <StavnetFooter
            items={footerItems}
            desktopMode="paired"
          />
        </div>
      </main>
    </>
  );
}
