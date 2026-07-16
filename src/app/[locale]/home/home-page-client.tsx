"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/home/language-switcher";
import { StarModelViewer } from "@/components/home/star-model-viewer";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";

interface HomePageClientProps {
  showLanguageSwitcher?: boolean;
}

export default function HomePageClient({ showLanguageSwitcher = false }: HomePageClientProps) {
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
        className="absolute left-[calc(50%-2px)] top-[44svh] z-30 h-[clamp(176px,23.5svh,230px)] w-[min(66vw,244px)] -translate-x-1/2 -translate-y-1/2 md:left-[21vw] md:right-auto md:top-[15vh] md:h-[74vh] md:w-[76vw] md:translate-x-0 md:translate-y-0 [@media(max-height:800px)]:md:left-[20vw] [@media(max-height:800px)]:md:top-[18vh] [@media(max-height:800px)]:md:h-[67vh] [@media(max-height:800px)]:md:w-[68vw]"
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

        {showLanguageSwitcher ? (
          <div className="relative z-50 mt-20 flex justify-center md:absolute md:left-[5.2vw] md:top-[220px] md:mt-0 md:block [@media(max-height:800px)]:top-[190px]">
            <LanguageSwitcher />
          </div>
        ) : null}

        <aside
          data-stavnet-animate="cover-description"
          className="hidden md:absolute md:left-[calc(5.2vw-30px)] md:top-[340px] md:z-40 md:block md:min-h-[372px] md:w-[244px] md:p-0 [@media(max-width:1100px)]:md:left-[calc(5.2vw-18px)] [@media(max-width:1100px)]:md:w-[220px] [@media(max-height:800px)]:top-[292px] [@media(max-height:800px)]:min-h-0"
        >
          <p className="px-3.5 py-3.5 text-center font-[Georgia,Times_New_Roman,serif] text-[21px] leading-[1.2] text-black [@media(max-height:800px)]:px-2 [@media(max-height:800px)]:py-2 [@media(max-height:800px)]:text-[18px] [@media(max-height:800px)]:leading-[1.1]">
            {`${tHome("coverDescriptionLine1")} ${tHome("coverDescriptionLine2")} ${tHome("coverDescriptionLine3")}`}
          </p>
        </aside>

        <section data-stavnet-animate="cover-content" className="mt-28 flex flex-1 flex-col md:hidden">
          <div className="flex flex-1 flex-col justify-end pb-[232px]">
            <div className="mx-auto w-full max-w-[460px] px-3 py-3">
              <p className="mx-auto max-w-[260px] text-center text-[24px] leading-[1.3] text-black">
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
