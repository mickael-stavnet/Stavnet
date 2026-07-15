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
        className="absolute left-[calc(50%-2px)] top-[44svh] z-30 h-[clamp(176px,23.5svh,230px)] w-[min(66vw,244px)] -translate-x-1/2 -translate-y-1/2 md:left-[21vw] md:right-auto md:top-[9vh] md:h-[74vh] md:w-[76vw] md:translate-x-0 md:translate-y-0"
      >
        <StarModelViewer />
      </section>

      <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[620px] flex-col px-4 pb-6 md:block md:h-screen md:max-w-none md:px-5 md:pb-8">
        <StavnetHeader
          pageName={
            <>
              {tHome("coverTitleLine1")}
              {tHome("coverTitleLine2") ? (
                <>
                  <br />
                  {tHome("coverTitleLine2")}
                </>
              ) : null}
            </>
          }
          title={tHome("coverMainTitle")}
          subtitle={tHome("coverSubtitle")}
        />

        <aside
          data-stavnet-animate="cover-description"
          className="hidden md:absolute md:left-[5.2vw] md:top-[156px] md:z-40 md:block md:min-h-[372px] md:w-[176px] md:border md:border-[#0016a8]/70 md:bg-[#fffdf2]/80 md:p-0 md:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72),0_10px_24px_rgba(0,22,168,0.08)] md:backdrop-blur-[1px]"
        >
          <div className="h-1.5 w-full bg-[#0016a8]" />
          <p className="px-3.5 py-3.5 text-left font-[Georgia,Times_New_Roman,serif] text-[16px] leading-[1.18] text-black first-letter:float-left first-letter:mr-1 first-letter:text-[43px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#0016a8]">
            {`${tHome("coverDescriptionLine1")} ${tHome("coverDescriptionLine2")} ${tHome("coverDescriptionLine3")}`}
          </p>
        </aside>

        <section data-stavnet-animate="cover-content" className="mt-5 flex flex-1 flex-col md:hidden">
          <div className="flex flex-1 flex-col justify-end pb-[232px]">
            <div className="mx-auto w-full max-w-[460px] border border-black/55 bg-white/45 px-3 py-3">
              <p className="text-center text-[18px] leading-[1.36] text-black">
                {`${tHome("coverDescriptionLine1")} ${tHome("coverDescriptionLine2")} ${tHome("coverDescriptionLine3")}`}
              </p>
            </div>
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
