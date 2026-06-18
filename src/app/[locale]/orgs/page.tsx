"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";

const sampleOrganizations = [
  ["Eked", "Editeur", "", "", "14", "10"],
  ["ITHL", "AutreOrganisme", "", "", "2739", "85"],
  ["Am Oved", "Editeur", "", "", "236", "53"],
  ["Ma’ariv", "Editeur", "", "", "50", "15"],
  ["Sifriat Poalim", "Editeur", "", "", "134", "29"],
  ["Bitan", "Editeur", "", "", "5", "4"],
  ["University Publishing Projects", "Editeur", "", "", "4", "1"],
  ["Hakibbutz Hameuchad", "Editeur", "", "", "260", "44"],
  ["BPI", "AutreOrganisme", "", "France", "290", "68"],
  ["Zmora-Bitan", "Editeur", "", "", "71", "21"],
  ["BnF", "AutreOrganisme", "", "France", "623", "109"],
  ["Keter", "Editeur", "", "Israel", "163", "32"],
  ["Siman Kriah", "Editeur", "", "", "59", "16"],
  ["BNI", "AutreOrganisme", "", "Israël", "541", "43"],
  ["Keshet", "Editeur", "", "", "20", "4"],
  ["Massada", "Editeur", "", "", "99", "28"],
  ["Proza", "Editeur", "", "", "4", "4"],
  ["Hargol", "Editeur", "", "", "3", "1"],
  ["Makhbarot Lesifrut", "Editeur", "", "", "11", "7"],
];

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

export default function OrganizationsListPage() {
  const t = useTranslations("Orgs");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/orgs" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/orgs" as const, label: t("footer.move") },
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
          titleBlockClassName="md:right-[4.7vw] md:left-auto md:w-[44vw]"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[154px] md:bottom-[128px] md:w-[min(1240px,94vw)] md:-translate-x-1/2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-end md:gap-8">
            <div className="flex items-center gap-3 text-[18px] leading-none text-black">
              <span>{t("stats.cardsFound")}</span>
              <span className="font-bold text-[#ff1d1d]">{t("stats.cardsFoundCount")}</span>
            </div>
            <div className="flex items-center gap-3 text-[18px] leading-none text-black">
              <span>{t("stats.databaseContains")}</span>
              <span>:</span>
              <span className="font-bold text-[#ff1d1d]">{t("stats.databaseContainsCount")}</span>
            </div>
          </div>

          <section className="min-h-0 flex-1 overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            <div
              className="grid border-b border-[#7aa8b7] bg-[#fff15a] text-[12px] uppercase leading-none text-black"
              style={{ gridTemplateColumns: "2.4fr 1.05fr 1.08fr 0.98fr 0.62fr 0.64fr" }}
            >
              <div className="rounded-tl-[8px] border-r border-[#7aa8b7] px-3 py-[10px]">{t("columns.organizations")}</div>
              <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.type")}</div>
              <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.creationDate")}</div>
              <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.country")}</div>
              <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.titlesPublished")}</div>
              <div className="rounded-tr-[8px] px-3 py-[10px] text-center">{t("columns.authorsPublished")}</div>
            </div>

            <div className="h-full overflow-auto">
              {sampleOrganizations.map((row, rowIndex) => (
                <div
                  key={`${row[0]}-${rowIndex}`}
                  className="grid border-b border-[#9bb2bc] text-[15px] leading-none text-black last:border-b-0"
                  style={{ gridTemplateColumns: "2.4fr 1.05fr 1.08fr 0.98fr 0.62fr 0.64fr" }}
                >
                  <div className="border-r border-[#9bb2bc] px-2 py-[9px]">
                    <Link href="/orgs/details" className="flex items-center text-black hover:underline">
                      <RedMarker />
                      <span>{row[0]}</span>
                    </Link>
                  </div>
                  <div className="border-r border-[#9bb2bc] px-2 py-[9px]">{row[1]}</div>
                  <div className="border-r border-[#9bb2bc] px-2 py-[9px]">{row[2]}</div>
                  <div className="border-r border-[#9bb2bc] px-2 py-[9px]">{row[3]}</div>
                  <div className="border-r border-[#9bb2bc] px-2 py-[9px] text-center">{row[4]}</div>
                  <div className="px-2 py-[9px] text-center">{row[5]}</div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.6vh] md:left-[6vw] md:right-[6vw]"
          itemClassName="md:min-h-[70px] md:text-[14px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-3"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
