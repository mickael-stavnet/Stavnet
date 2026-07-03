"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SearchField({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-[6px] ${className ?? ""}`}>
      <span className="text-[16px] leading-none text-black md:text-[17px]">
        {label}
      </span>
      <Input className="h-11 rounded-none border-[#78b8cd] bg-[#a9ddf0] px-[8px] text-[16px] font-bold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] focus-visible:border-[#4d8da6] focus-visible:ring-0 md:h-[32px]" />
    </label>
  );
}

export default function SearchPageClient() {
  const t = useTranslations("SearchPage");

  const handleQuit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Do you really want to close this tab?")) {
      window.close();
      setTimeout(() => {
        if (!window.closed) {
          alert(
            "Your browser blocked the automatic closing of the tab. Please close it manually.",
          );
        }
      }, 500);
    }
  };

  const footerItems = [
    {
      key: "back",
      icon: "/icons/icons-nav/back.png",
      href: "/home" as const,
      label: t("footer.back"),
    },
    {
      key: "menu",
      icon: "/icons/icons-nav/menu.png",
      href: "/menu" as const,
      label: t("footer.menu"),
    },
    {
      key: "quit",
      icon: "/icons/icons-nav/close.png",
      href: "/" as const,
      label: t("footer.quit"),
      onClick: handleQuit,
    },
    {
      key: "help",
      icon: "/icons/icons-nav/help.png",
      href: "/search" as const,
      label: t("footer.help"),
    },
  ];

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
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
        />

        <section className="mt-6 rounded-[16px] border border-[#9fc6d5] bg-[rgba(232,246,251,0.82)] p-4 shadow-[0_10px_24px_rgba(80,126,145,0.18)] backdrop-blur-[1px] md:absolute md:left-[4.9vw] md:right-[4.9vw] md:top-[286px] md:mx-auto md:w-full md:max-w-[1104px] md:p-5">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-[264px_1fr] md:items-stretch md:gap-[22px]">
          <aside className="flex flex-col rounded-[10px] border border-[#5da9c5] bg-[#9cd5eb] px-3 py-5 text-center shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)] md:overflow-hidden">
            <p className="text-[18px] font-bold leading-tight">
              {t("info.modeLine1")} {t("info.modeLine2")}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-left text-[15px] leading-[1.35]">
                {t("info.otherAlphabetLine1")} {t("info.otherAlphabetLine2")}{" "}
                {t("info.otherAlphabetLine3")}
              </p>
              <Button
                type="button"
                className="mx-auto h-11 w-full max-w-[198px] rounded-none border border-[#caa200] bg-[#ffcc17] px-2 text-[15px] font-bold text-black shadow-none hover:bg-[#ffd43d] focus-visible:ring-0 md:h-[24px]"
              >
                {t("actions.otherAlphabets")}
              </Button>
            </div>

            <div className="mt-8 flex flex-col gap-6">
              <div className="space-y-1">
                <p className="text-[17px] font-bold underline decoration-[#5da9c5] underline-offset-4">
                  {t("labels.publicationLanguage")}
                </p>
                <p className="text-left text-[14px] leading-[1.35] opacity-90">
                  {t("info.languageLine3")} {t("info.languageLine4")}{" "}
                  {t("info.languageLine5")}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[17px] font-bold underline decoration-[#5da9c5] underline-offset-4">
                  {t("labels.theme")}
                </p>
                <p className="text-left text-[14px] leading-[1.35] opacity-90">
                  {t("info.themeLine3")} {t("info.themeLine4")}
                </p>
              </div>
            </div>
          </aside>

          <form className="flex flex-col md:w-full md:max-w-[818px]">
            <div className="flex flex-col gap-y-5">
              <SearchField label={t("labels.title")} />

              <div className="flex flex-col gap-[8px]">
                <p className="text-left text-[15px] leading-[1.2] text-black md:text-[16px]">
                  {t("labels.personDescription")}
                </p>
                <div className="grid gap-x-[42px] gap-y-3 md:grid-cols-2">
                  <SearchField label={t("labels.lastName")} />
                  <SearchField label={t("labels.firstName")} />
                </div>
              </div>

              <SearchField label={t("labels.organizationDescription")} />

              <div className="grid gap-x-[26px] gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_186px] md:items-start">
                <SearchField label={t("labels.theme")} />
                <SearchField label={t("labels.publicationLanguage")} />
                <SearchField label={t("labels.year")} />
              </div>

              <SearchField label={t("labels.generalSearch")} />
            </div>

            <Button
              type="submit"
              className="mt-6 h-11 rounded-none border border-[#caa200] bg-[#ffcc17] text-[17px] font-bold text-black shadow-none hover:bg-[#ffd43d] focus-visible:ring-0 md:h-[32px]"
            >
              {t("actions.validate")}
            </Button>
          </form>
          </div>
        </section>

        <StavnetFooter
          items={footerItems}
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
