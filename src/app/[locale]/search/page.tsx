import Image from "next/image";
import { useTranslations } from "next-intl";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function PickerGlyph() {
  return (
    <div className="flex h-[28px] w-[24px] shrink-0 items-center justify-center rounded-[2px] border border-[#7b5ca9] bg-[linear-gradient(180deg,#6d40a4_0%,#41287f_100%)] shadow-[1px_1px_0_rgba(255,255,255,0.45)]">
      <div className="grid h-[18px] w-[16px] grid-cols-3 gap-[1px]">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`rounded-[1px] ${index % 2 === 0 ? "bg-[#f4d12d]" : "bg-[#6ea6cf]"}`}
          />
        ))}
      </div>
    </div>
  );
}

function SearchField({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-[6px] ${className ?? ""}`}>
      <span className="text-[17px] leading-none text-black">{label}</span>
      <Input
        className="h-[32px] rounded-none border-[#78b8cd] bg-[#a9ddf0] px-[8px] text-[16px] font-bold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] focus-visible:border-[#4d8da6] focus-visible:ring-0"
      />
    </label>
  );
}

export default function SearchPage() {
  const t = useTranslations("SearchPage");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "quit", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.quit") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/search" as const, label: t("footer.help") },
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

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          headerClassName="md:h-[146px]"
          badgeClassName="md:h-[112px] md:w-[236px]"
          titleBlockClassName="md:right-[4.7vw] md:left-auto md:w-[40vw]"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex flex-col gap-5 md:absolute md:left-[4.9vw] md:right-[4.9vw] md:top-[156px] md:grid md:grid-cols-[252px_minmax(0,1fr)] md:items-stretch md:gap-[22px]">
          <aside className="h-fit rounded-[10px] border border-[#5da9c5] bg-[#9cd5eb] px-5 py-4 text-center shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)] md:h-[502px] md:overflow-hidden md:pt-[14px]">
            <p className="text-[18px] leading-[1.35]">{t("info.modeLine1")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.modeLine2")}</p>
            <p className="mt-3 text-[18px] leading-[1.35]">{t("info.otherAlphabetLine1")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.otherAlphabetLine2")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.otherAlphabetLine3")}</p>
            <p className="mb-2 text-[18px] leading-[1.35]">{t("info.clickHere")}</p>

            <Button
              type="button"
              className="mx-auto h-[24px] w-full max-w-[198px] rounded-none border border-[#caa200] bg-[#ffcc17] px-2 text-[16px] font-bold text-black shadow-none hover:bg-[#ffd43d] focus-visible:ring-0"
            >
              {t("actions.otherAlphabets")}
            </Button>

            <p className="mt-3 text-[18px] leading-[1.35]">{t("info.languageLine1")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.languageLine2")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.languageLine3")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.languageLine4")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.languageLine5")}</p>
            <p className="mt-3 text-[18px] leading-[1.35]">{t("info.themeLine1")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.themeLine2")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.themeLine3")}</p>
            <p className="text-[18px] leading-[1.35]">{t("info.themeLine4")}</p>
          </aside>

          <form className="flex flex-col pb-4 md:h-[502px] md:pt-[2px]">
            <div className="flex flex-1 flex-col justify-between">
              <SearchField label={t("labels.title")} />

              <div className="flex flex-col gap-[10px]">
                <p className="text-[17px] leading-none text-black">{t("labels.personDescription")}</p>
                <div className="grid gap-x-[42px] gap-y-3 md:grid-cols-2">
                  <SearchField label={t("labels.lastName")} />
                  <SearchField label={t("labels.firstName")} />
                </div>
              </div>

              <SearchField label={t("labels.organizationDescription")} />

              <div className="grid gap-x-[26px] gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_186px] md:items-end">
                <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-[6px]">
                  <PickerGlyph />
                  <SearchField label={t("labels.theme")} />
                </div>
                <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-[6px]">
                  <PickerGlyph />
                  <SearchField label={t("labels.publicationLanguage")} />
                </div>
                <SearchField label={t("labels.year")} />
              </div>

              <SearchField label={t("labels.generalSearch")} className="pt-[4px]" />
            </div>

            <Button
              type="submit"
              className="mt-[14px] h-[32px] rounded-none border border-[#caa200] bg-[#ffcc17] text-[17px] font-bold text-black shadow-none hover:bg-[#ffd43d] focus-visible:ring-0"
            >
              {t("actions.validate")}
            </Button>
          </form>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.2vh] md:left-[6vw] md:right-[6vw]"
          itemClassName="md:min-h-[64px] md:text-[14px]"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
