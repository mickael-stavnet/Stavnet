'use client';

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";

export default function HomePage() {
  const t = useTranslations("Home");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("back") },
    { key: "next", icon: "/icons/icons-nav/next.png", href: "/home" as const, label: t("next") },
  ];

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#e6f2f8] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex min-h-[100svh] w-full flex-col justify-center px-6 pb-10 pt-0 md:block md:min-h-screen md:p-0">
        <StavnetHeader
          pageName={
            <>
              {t("coverTitleLine1")}
              <br />
              {t("coverTitleLine2")}
            </>
          }
          title={t("coverMainTitle")}
          subtitle={t("coverSubtitle")}
          headerClassName="md:h-[146px]"
          badgeClassName="md:h-[112px] md:w-[272px]"
          titleBlockClassName="md:right-[4.9vw] md:top-0 md:flex md:h-[112px] md:w-[35vw] md:flex-col md:items-end md:justify-center"
          titleClassName="text-[30px] not-italic md:text-[38px]"
          subtitleClassName="text-[15px] md:text-[18px]"
          logoClassName="md:left-[5.1vw] md:top-0 md:w-[22vw] md:max-w-[350px]"
        />

        <section data-stavnet-animate="cover-content" className="mt-9 flex w-full flex-col items-center md:relative md:mt-0 md:block md:min-h-screen">
        <Image
          src="/images/home/home-image-banner.png"
          alt="Paysage architectural en Israël"
          width={896}
          height={424}
          priority
          sizes="(max-width: 767px) 82vw, 80vw"
          className="relative z-10 h-auto w-[82vw] max-w-[520px] object-contain md:absolute md:left-[10vw] md:top-[22.05vh] md:mt-0 md:h-[60.15vh] md:w-[80vw] md:max-w-none md:object-fill"
        />

        <StavnetFooter
          items={footerItems}
          className="relative z-10 mt-6 w-[min(86vw,520px)] md:absolute md:bottom-[2.3vh] md:left-[5.1vw] md:right-[5.1vw] md:mt-0 md:w-auto"
          itemClassName="md:min-h-[72px] md:min-w-[92px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-2"
          desktopMode="cover"
          centerContent={
            <p className="mx-auto max-w-[980px] text-center text-[15px] leading-[1.35] text-black md:w-[70.7vw] md:text-[clamp(14px,1.55vw,20px)] md:leading-[1.42]">
              {t("coverDescriptionLine1")}
              <br />
              {t("coverDescriptionLine2")}
              <br />
              {t("coverDescriptionLine3")}
            </p>
          }
        />
        </section>
      </div>
    </main>
  );
}
