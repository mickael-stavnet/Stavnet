import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { getBookStatisticsFacetLists } from "@/lib/data/books";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

interface StatisticsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

type StatisticGroupKey = "accounting" | "distribution" | "comparison" | "other";
type StatisticListKey = "translationLanguages" | "originalCountries" | "translationCountries";

const groupKeys: StatisticGroupKey[] = ["accounting", "distribution", "comparison", "other"];
const listKeys: StatisticListKey[] = ["translationLanguages", "originalCountries", "translationCountries"];

const optionCounts: Record<StatisticGroupKey, number> = {
  accounting: 8,
  distribution: 7,
  comparison: 4,
  other: 3,
};

function normalizeDisplayFacetKey(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]/gu, "")
    .toLocaleLowerCase();
}

function dedupeDisplayFacets(values: string[]): string[] {
  const uniqueValues = new Map<string, string>();

  for (const value of values) {
    const cleanedValue = value.trim();

    if (!cleanedValue) {
      continue;
    }

    const key = normalizeDisplayFacetKey(cleanedValue);
    const currentValue = uniqueValues.get(key);

    if (!currentValue || cleanedValue.length < currentValue.length || /\p{Diacritic}/u.test(cleanedValue)) {
      uniqueValues.set(key, cleanedValue);
    }
  }

  return [...uniqueValues.values()].sort((left, right) => left.localeCompare(right, "fr", { sensitivity: "base" }));
}

export async function generateMetadata({ params }: StatisticsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "statistics", "/statistics");
}

function EmptyCheckbox() {
  return (
    <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center border border-[#9da9ad] bg-[#e6eef3] shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)]" />
  );
}

function OptionRow({ label }: { label: string }) {
  return (
    <label className="flex min-h-[28px] items-center gap-[9px] border-b border-[#bcc6ca]/80 bg-[rgba(235,241,243,0.46)] px-[8px] text-[18px] font-bold leading-none text-black last:border-b-0 [@media(max-height:950px)]:min-h-[25px] [@media(max-height:950px)]:text-[16px]">
      <EmptyCheckbox />
      <span>{label}</span>
    </label>
  );
}

function OptionGroup({ title, options, className = "" }: { title: string; options: string[]; className?: string }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <h2 className="mb-[6px] text-[20px] font-bold leading-none text-[#0018c9] [@media(max-height:950px)]:text-[18px]">{title}</h2>
      <div className="flex-1 border border-[#9aa8ad] bg-[rgba(226,235,238,0.48)]">
        {options.map((option) => (
          <OptionRow key={option} label={option} />
        ))}
      </div>
    </section>
  );
}

function YellowList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="min-w-0 border border-[#768a9a] bg-[#ffff86] shadow-[1px_1px_0_rgba(0,0,0,0.28)]">
      <h2 className="bg-[#0000b8] px-[9px] py-[6px] text-[18px] font-bold leading-none text-white [@media(max-height:950px)]:text-[16px]">{title}</h2>
      <div className="h-[198px] overflow-y-auto py-[4px] [@media(max-height:950px)]:h-[170px]">
        {items.map((item) => (
          <label key={item} className="flex min-h-[26px] items-center gap-[10px] px-[9px] text-[18px] font-bold leading-none text-black [@media(max-height:950px)]:min-h-[23px] [@media(max-height:950px)]:text-[16px]">
            <EmptyCheckbox />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function PeriodPanel({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <section className="min-w-0 border border-[#768a9a] bg-[#ffff86] shadow-[1px_1px_0_rgba(0,0,0,0.28)]">
      <h2 className="bg-[#0000b8] px-[9px] py-[6px] text-[18px] font-bold leading-none text-white [@media(max-height:950px)]:text-[16px]">{title}</h2>
      <div>
        {rows.map((row) => (
          <div key={row.label} className="grid min-h-[28px] grid-cols-[1fr_72px] items-center border-b border-[#e7d765] px-[8px] text-[18px] font-bold leading-none text-black last:border-b-0 [@media(max-height:950px)]:min-h-[24px] [@media(max-height:950px)]:text-[16px]">
            <span>{row.label}</span>
            <span className="text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function StatisticsPage() {
  const [t, facetLists] = await Promise.all([
    getTranslations("StatisticsPage"),
    getBookStatisticsFacetLists(),
  ]);
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/menu" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/menu" as const, label: t("footer.help") },
  ];
  const groups = groupKeys.map((key) => ({
    key,
    title: t(`groups.${key}.title`),
    options: Array.from({ length: optionCounts[key] }, (_, index) => t(`groups.${key}.options.${index}`)),
  }));
  const lists = listKeys.map((key) => ({
    key,
    title: t(`lists.${key}.title`),
    items: dedupeDisplayFacets(facetLists[key]),
  }));
  const periodRows = [
    { label: t("period.rows.0.label"), value: facetLists.period.startYear },
    { label: t("period.rows.1.label"), value: facetLists.period.endYear },
    { label: t("period.rows.2.label"), value: facetLists.period.interval },
  ];

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          badgeClassName="md:bottom-[8px]"
          titleClassName="md:text-[35px]"
          subtitleClassName="md:text-[18px]"
        />

        <section className="mt-6 flex min-w-0 flex-col md:absolute md:left-1/2 md:top-[154px] md:bottom-[128px] md:w-[min(1320px,92vw)] md:-translate-x-1/2 md:justify-between md:overflow-hidden [@media(max-height:950px)]:top-[144px] [@media(max-height:950px)]:bottom-[118px]">
          <div className="text-center">
            <h1 className="text-[24px] font-bold leading-tight text-black md:text-[26px] [@media(max-height:950px)]:text-[23px]">{t("title")}</h1>
            <p className="mx-auto mt-[14px] max-w-[1340px] text-left text-[18px] leading-[1.26] text-black [@media(max-height:950px)]:text-[16px]">
              {t("description")}
            </p>
          </div>

          <div className="mt-[18px] grid min-h-0 gap-[14px] md:h-[234px] md:grid-cols-[1.06fr_1fr_1.05fr] md:items-stretch md:gap-[18px] [@media(max-height:950px)]:mt-[14px] [@media(max-height:950px)]:h-[208px]">
            <div className="flex min-w-0 flex-col">
              <OptionGroup title={groups[0].title} options={groups[0].options} className="flex h-full flex-col" />
            </div>
            <div className="flex min-w-0 flex-col">
              <OptionGroup title={groups[1].title} options={groups[1].options} className="flex h-full flex-col" />
            </div>
            <div className="grid min-w-0 grid-rows-[auto_1fr] gap-[6px]">
              <OptionGroup title={groups[2].title} options={groups[2].options} />
              <OptionGroup title={groups[3].title} options={groups[3].options} className="self-end" />
            </div>
          </div>

          <div className="mt-[24px] grid gap-[14px] md:grid-cols-[1fr_1fr_1fr_1fr] md:gap-[38px] [@media(max-height:950px)]:mt-[24px]">
            {lists.map((list) => (
              <YellowList key={list.key} title={list.title} items={list.items} />
            ))}
            <PeriodPanel title={t("period.title")} rows={periodRows} />
          </div>

          <button
            type="button"
            className="mt-[20px] h-[27px] shrink-0 border border-[#505050] bg-[linear-gradient(180deg,#f1f1f1_0%,#cfcfcf_100%)] text-[14px] font-normal leading-none text-black shadow-[inset_1px_1px_0_rgba(255,255,255,0.7)] [@media(max-height:950px)]:mt-[16px] [@media(max-height:950px)]:h-[24px] [@media(max-height:950px)]:text-[13px]"
          >
            {t("actions.validate")}
          </button>
        </section>

        <StavnetFooter items={footerItems} className="md:left-[7.2vw] md:right-[7.2vw]" desktopMode="equal" />
      </div>
    </main>
  );
}
