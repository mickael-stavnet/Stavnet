'use client';

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.08),rgba(210,229,242,0.02))]" />

      <div className="relative z-10 flex min-h-[100svh] w-full flex-col px-4 pb-6 pt-0 md:block md:min-h-screen md:p-0">
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
          titleBlockClassName="md:w-[80vw]"
        />

        <section data-stavnet-animate="cover-content" className="mt-5 flex flex-1 flex-col md:hidden">
          <div className="flex flex-1 flex-col justify-center">
            <Image
              src="/images/home/home-image-banner.png"
              alt="Paysage architectural en Israël"
              width={896}
              height={424}
              priority
              sizes="92vw"
              className="mx-auto h-auto w-[92vw] max-w-[390px] object-contain"
            />

            <div className="mx-auto mt-5 w-full max-w-[390px] px-2 text-justify">
              <p className="text-[18px] leading-[1.34] text-black">
                {t("coverDescriptionLine1")}
              </p>
              <p className="mt-3 text-[18px] leading-[1.34] text-black">
                {t("coverDescriptionLine2")}
              </p>
              <p className="mt-3 text-[18px] leading-[1.34] text-black">
                {t("coverDescriptionLine3")}
              </p>
            </div>
          </div>

          <nav className="mt-auto flex w-full max-w-[390px] items-end justify-between pb-1 pt-6">
            {footerItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="flex min-h-[88px] w-[92px] flex-col items-center justify-end text-center text-black"
              >
                <div className="relative h-[54px] w-[76px] shrink-0">
                  <Image
                    src={item.icon}
                    alt=""
                    fill
                    sizes="76px"
                    className="object-contain"
                  />
                </div>
                <span className="mt-[10px] text-[18px] font-bold leading-none text-black">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section data-stavnet-animate="cover-content" className="hidden w-full md:relative md:mt-0 md:block md:min-h-screen">
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
