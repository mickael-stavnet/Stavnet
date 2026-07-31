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
        src="/background/background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <section
        data-stavnet-animate="star-viewer"
        className="absolute left-[calc(50%-2px)] top-[44svh] z-30 hidden h-[clamp(176px,23.5svh,230px)] w-[min(66vw,244px)] -translate-x-1/2 -translate-y-1/2 md:block md:left-[21vw] md:right-auto md:top-[15vh] md:h-[74vh] md:w-[76vw] md:translate-x-0 md:translate-y-0 [@media(max-height:800px)]:md:left-[20vw] [@media(max-height:800px)]:md:top-[18vh] [@media(max-height:800px)]:md:h-[67vh] [@media(max-height:800px)]:md:w-[68vw]"
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
          headerClassName="h-[168px] !block !pt-0 md:!h-[146px] md:!pt-2"
          logoClassName="!absolute !left-1/2 !top-3 !flex !w-[244px] !-translate-x-1/2 !justify-center md:!left-[calc(5.2vw-34px)] md:!top-3 md:!bottom-auto md:!translate-x-0"
          logoImageClassName="!w-[244px]"
          badgeClassName="!hidden md:!flex"
        />

        {showLanguageSwitcher ? (
          <div className="relative z-50 mt-8 flex justify-center md:absolute md:left-[calc(5.2vw-34px)] md:top-[220px] md:mt-0 md:block [@media(max-height:800px)]:top-[190px]">
            <LanguageSwitcher />
          </div>
        ) : null}

        <aside
          data-stavnet-animate="cover-description"
          className="hidden md:absolute md:left-[calc(5.2vw-47px)] md:top-[340px] md:z-40 md:block md:min-h-[372px] md:w-[270px] md:p-0 [@media(max-height:800px)]:top-[292px] [@media(max-height:800px)]:min-h-0"
        >
          <p className="px-0 py-3.5 text-center font-[Georgia,Times_New_Roman,serif] text-[26.25px] leading-[1.36] text-black [@media(max-height:800px)]:py-0 [@media(max-height:800px)]:text-[22.5px] [@media(max-height:800px)]:leading-[1.36]">
            {`${tHome("coverDescriptionLine1")} ${tHome("coverDescriptionLine2")} ${tHome("coverDescriptionLine3")}`}
          </p>
        </aside>

        <section data-stavnet-animate="cover-content" className="mt-[100px] md:hidden">
          <div className="mx-auto w-[244px] px-0 py-3">
              <p className="w-full text-center font-[Georgia,Times_New_Roman,serif] text-[24px] leading-[1.45] text-black">
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
