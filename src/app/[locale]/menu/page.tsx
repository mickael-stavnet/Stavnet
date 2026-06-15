"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";

const menuColumns = [
  {
    key: "books",
    icon: "/images/home-menu/icon-introduction.png",
    titleColor: "#ff3d00",
  },
  {
    key: "persons",
    icon: "/images/home-menu/icon-menu.png",
    titleColor: "#ff3d00",
  },
  {
    key: "organizations",
    icon: "/icons/icons-nav/cart-2.png",
    titleColor: "#ff3d00",
  },
] as const;

export default function MenuPage() {
  const t = useTranslations("MenuPage");
  const [activeMenu, setActiveMenu] = useState<(typeof menuColumns)[number]["key"]>("books");
  const centralSectionRef = useRef<HTMLElement>(null);
  const menuButtonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const submenuItemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const activeIndex = menuColumns.findIndex((column) => column.key === activeMenu);
  const quickActions = [
    ["libraries", "/orgs"],
    ["editions", "/menu"],
    ["bookstores", "/menu"],
    ["statistics", "/menu"],
  ] as const;
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("bottom.back") },
    { key: "welcome", icon: "/icons/icons-nav/welcome.png", href: "/home" as const, label: t("bottom.welcome") },
    { key: "video", icon: "/images/home-menu/icon-video.png", href: "/menu" as const, label: t("bottom.video") },
    { key: "diaporama", icon: "/images/home-menu/icon-diaporama.png", href: "/menu" as const, label: t("bottom.diaporama") },
    { key: "sound", icon: "/images/home-menu/icon-sound.png", href: "/menu" as const, label: t("bottom.sound") },
    { key: "introduction", icon: "/images/home-menu/icon-introduction.png", href: "/menu" as const, label: t("bottom.introduction") },
    { key: "help", icon: "/images/home-menu/icon-help.png", href: "/menu" as const, label: t("bottom.help") },
    { key: "close", icon: "/images/home-menu/icon-close.png", href: "/menu" as const, label: t("bottom.close") },
  ];

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

    const activeButton = menuButtonsRef.current[activeIndex];
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
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-[#0c2740] md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          headerClassName="md:h-[146px]"
          badgeClassName="md:h-[112px] md:w-[236px]"
          titleBlockClassName="md:right-[4.9vw] md:left-auto md:w-[35vw]"
        />

        <section data-stavnet-animate="menu-content" ref={centralSectionRef} className="mt-[146px] flex flex-col gap-4 md:absolute md:left-[4.5vw] md:right-[4.5vw] md:top-[270px] md:mt-0 md:h-[560px] md:gap-0">
          <div className="flex flex-col gap-4 md:absolute md:left-0 md:right-0 md:top-0 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[468px] text-center md:text-left">
              <p className="text-[18px] font-bold italic leading-[1.02] text-black">
                {t("intro.leftLine1")}
              </p>
              <p className="text-[18px] font-bold italic leading-[1.02] text-black">
                {t("intro.leftLine2")}
              </p>
            </div>

            <div className="flex items-start justify-center gap-3 self-center md:mr-[0.4vw] md:mt-[3px] md:self-start">
              <div className="max-w-[310px] text-center md:text-right">
                <p className="text-[18px] font-bold italic leading-[1.02] text-black">
                  {t("intro.rightLine1")}
                </p>
                <p className="text-[18px] font-bold italic leading-[1.02] text-black">
                  {t("intro.rightLine2")}
                </p>
              </div>
              <Image
                src="/images/home-menu/icon-search.png"
                alt=""
                width={72}
                height={46}
                className="mt-[4px] h-[40px] w-auto object-contain"
              />
            </div>
          </div>

          <div className="grid gap-4 md:absolute md:left-0 md:right-0 md:top-[76px] md:grid-cols-3 md:gap-5">
            {menuColumns.map((column, columnIndex) => (
              <button
                key={column.key}
                type="button"
                ref={(element) => {
                  menuButtonsRef.current[columnIndex] = element;
                }}
                onMouseEnter={() => setActiveMenu(column.key)}
                onFocus={() => setActiveMenu(column.key)}
                onClick={() => setActiveMenu(column.key)}
                className="flex min-w-0 items-start gap-3 text-left will-change-transform"
              >
                <Image
                  src={column.icon}
                  alt=""
                  width={58}
                  height={58}
                  className={`h-auto shrink-0 object-contain ${
                    column.key === "persons"
                      ? "w-[60px]"
                      : column.key === "organizations"
                        ? "w-[60px]"
                        : "w-[54px]"
                  }`}
                />
                <div className="pt-[2px]">
                  <h2
                    className="text-[20px] font-bold leading-none"
                    style={{ color: column.titleColor }}
                  >
                    {t(`columns.${column.key}.title`)}
                  </h2>
                  <p className="mt-[2px] text-[17px] font-bold italic leading-[1.04] text-[#0018c9]">
                    {t(`columns.${column.key}.subtitleLine1`)}
                  </p>
                  <p className="text-[17px] font-bold italic leading-[1.04] text-[#0018c9]">
                    {t(`columns.${column.key}.subtitleLine2`)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <section className="rounded-b-[28px] rounded-tr-[6px] bg-[#a6def3] px-6 py-4 shadow-[9px_9px_11px_rgba(0,0,0,0.36)] md:absolute md:left-0 md:right-0 md:top-[152px] md:min-h-[250px] md:px-4 md:py-5">
            <div className="grid gap-7 md:grid-cols-3 md:gap-5">
              {menuColumns.map((column) => (
                <article key={column.key} className="min-w-0">
                  {activeMenu === column.key ? (
                    <ul className="space-y-[5px] pt-[8px] text-[18px] font-bold leading-none text-[#233341] md:pl-[46px]">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <li
                          key={index}
                          ref={(element) => {
                            submenuItemsRef.current[index] = element;
                          }}
                          className="flex items-start gap-[8px]"
                        >
                          <span className="mt-[6px] h-[10px] w-[10px] shrink-0 rounded-full border-2 border-[#ff162d]" />
                          <span>{t(`columns.${column.key}.items.${index}`)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-4 pt-1 sm:grid-cols-2 md:absolute md:left-0 md:right-0 md:top-[432px] md:grid-cols-4 md:gap-8 md:px-[0.1vw]">
            {quickActions.map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className="flex h-[54px] items-center justify-center rounded-bl-[11px] rounded-tr-[4px] bg-[linear-gradient(90deg,#ff6d23_0%,#ffb534_46%,#fff043_100%)] px-4 text-center text-[21px] font-bold text-[#0018c9] shadow-[8px_9px_9px_rgba(0,0,0,0.32)] md:h-[52px]"
              >
                {t(`quickActions.${key}`)}
              </Link>
            ))}
          </div>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.3vh]"
        />
      </div>
    </main>
  );
}
