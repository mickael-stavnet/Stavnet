"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StarModelViewer } from "@/components/home/star-model-viewer";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";

export default function HomePageClient() {
  const tHome = useTranslations("Home");
  const tHomeMenu = useTranslations("HomeMenu");
  const footerItems = [
    {
      key: "search",
      icon: "/icons/icons-nav/rechercher.png",
      href: "/search" as const,
      label: tHomeMenu("actions.search"),
    },
    {
      key: "menu",
      icon: "/icons/icons-nav/menu.png",
      href: "/menu" as const,
      label: tHomeMenu("actions.menu"),
    },
    {
      key: "video",
      icon: "/icons/icons-nav/video.png",
      href: "/home" as const,
      label: tHomeMenu("actions.video"),
    },
    {
      key: "diaporama",
      icon: "/icons/icons-nav/diapo.png",
      href: "/home" as const,
      label: tHomeMenu("actions.diaporama"),
    },
    {
      key: "sound",
      icon: "/icons/icons-nav/sound.png",
      href: "/home" as const,
      label: tHomeMenu("actions.sound"),
    },
    {
      key: "introduction",
      icon: "/icons/icons-nav/introduction.png",
      href: "/home" as const,
      label: tHomeMenu("actions.introduction"),
    },
    {
      key: "help",
      icon: "/icons/icons-nav/help.png",
      href: "/home" as const,
      label: tHomeMenu("actions.help"),
    },
    {
      key: "close",
      icon: "/icons/icons-nav/close.png",
      href: "/home" as const,
      label: tHomeMenu("actions.close"),
    },
    {
      key: "next",
      icon: "/icons/icons-nav/next.png",
      href: "/menu" as const,
      label: tHomeMenu("actions.next"),
    },
  ];

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <section
        data-stavnet-animate="star-viewer"
        className="pointer-events-none absolute left-[calc(50%-2px)] top-[48svh] z-10 h-[clamp(190px,26svh,250px)] w-[min(72vw,270px)] -translate-x-1/2 -translate-y-1/2 md:left-0 md:right-0 md:top-[15vh] md:h-[73vh] md:w-full md:translate-x-0 md:translate-y-0"
      >
        <StarModelViewer />
      </section>

      <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[620px] flex-col px-4 pb-6 md:block md:h-screen md:max-w-none md:px-5 md:pb-8">
        <StavnetHeader
          pageName={
            <>
              {tHome("coverTitleLine1")}
              <br />
              {tHome("coverTitleLine2")}
            </>
          }
          title={tHome("coverMainTitle")}
          subtitle={tHome("coverSubtitle")}
        />

        <section data-stavnet-animate="cover-content" className="mt-5 flex flex-1 flex-col md:hidden">
          <div className="flex flex-1 flex-col justify-end pb-[188px]">
            <div className="mx-auto w-full max-w-[520px] px-2 text-center">
              <p className="text-[18px] leading-[1.36] text-black">
                {`${tHome("coverDescriptionLine1")} ${tHome("coverDescriptionLine2")} ${tHome("coverDescriptionLine3")}`}
              </p>
            </div>
          </div>
        </section>

        <section data-stavnet-animate="cover-content" className="hidden md:block">
          <div className="absolute left-1/2 top-[82.5vh] w-[96vw] max-w-none -translate-x-1/2 text-center">
            <p className="w-full text-[clamp(18px,1.22vw,22px)] leading-[1.42] text-black">
              {`${tHome("coverDescriptionLine1")} ${tHome("coverDescriptionLine2")} ${tHome("coverDescriptionLine3")}`}
            </p>
          </div>
        </section>

        <div className="flex-1 md:hidden" />

        <StavnetFooter
          items={footerItems}
          className="mt-0 pb-1 md:mt-4 md:pb-2 md:!bottom-[22px]"
          itemClassName="min-h-[68px] text-[13px]"
          mobileGridClassName="grid-cols-4"
        />
      </div>
    </main>
  );
}
