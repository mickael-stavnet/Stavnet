import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Checkbox } from "@/components/ui/checkbox";
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

function SelectionCheckbox({ label }: { label: string }) {
  return (
    <Checkbox
      aria-label={label}
      className="h-[14px] w-[14px] rounded-none border-[#456f87] bg-[#f7fcff] text-white data-checked:border-[#002b9e] data-checked:bg-[#002b9e]"
    />
  );
}

function OptionRow({ label }: { label: string }) {
  return (
    <label className="flex min-h-[28px] items-center gap-[9px] border-b border-[#9fc1ce] bg-[#edf8fb]/90 px-[9px] text-[17px] font-semibold leading-none text-[#132c38] last:border-b-0 [@media(max-height:950px)]:min-h-[20px] [@media(max-height:950px)]:text-[13px]">
      <SelectionCheckbox label={label} />
      <span>{label}</span>
    </label>
  );
}

function OptionGroup({ title, options, className = "" }: { title: string; options: string[]; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden border border-[#6295a9] bg-[#d4edf5] ${className}`}>
      <h2 className="border-b border-[#6295a9] bg-[#b5e0ee] px-[10px] py-[7px] text-[18px] font-bold leading-none text-[#002b9e] [@media(max-height:950px)]:py-[4px] [@media(max-height:950px)]:text-[14px]">{title}</h2>
      <div className="flex-1 bg-[#dff2f8]">
        {options.map((option) => (
          <OptionRow key={option} label={option} />
        ))}
      </div>
    </section>
  );
}

function YellowList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="min-w-0 overflow-hidden border border-[#456f87] bg-[#fff58a] shadow-[2px_2px_0_rgba(0,43,112,0.2)]">
      <h2 className="bg-[#002b9e] px-[10px] py-[7px] text-[18px] font-bold leading-none text-white [@media(max-height:950px)]:py-[4px] [@media(max-height:950px)]:text-[14px]">{title}</h2>
      <div className="h-[198px] overflow-y-auto bg-[#fffbd1] py-[4px] [@media(max-height:950px)]:h-[128px]">
        {items.map((item) => (
          <label key={item} className="flex min-h-[27px] items-center gap-[10px] border-b border-[#ebdf7b] px-[10px] text-[17px] font-semibold leading-none text-[#172330] last:border-b-0 [@media(max-height:950px)]:min-h-[20px] [@media(max-height:950px)]:text-[13px]">
            <SelectionCheckbox label={item} />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function PeriodPanel({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <section className="min-w-0 overflow-hidden border border-[#456f87] bg-[#fff58a] shadow-[2px_2px_0_rgba(0,43,112,0.2)]">
      <h2 className="bg-[#002b9e] px-[10px] py-[7px] text-[18px] font-bold leading-none text-white [@media(max-height:950px)]:py-[4px] [@media(max-height:950px)]:text-[14px]">{title}</h2>
      <div className="bg-[#fffbd1]">
        {rows.map((row) => (
          <div key={row.label} className="grid min-h-[30px] grid-cols-[1fr_72px] items-center border-b border-[#ebdf7b] px-[10px] text-[17px] font-semibold leading-none text-[#172330] last:border-b-0 [@media(max-height:950px)]:min-h-[21px] [@media(max-height:950px)]:text-[13px]">
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

        <section className="mt-6 flex min-w-0 flex-col md:absolute md:left-1/2 md:top-[158px] md:bottom-[116px] md:w-[min(1240px,90vw)] md:-translate-x-1/2 md:overflow-y-auto md:pr-[4px] [@media(max-height:950px)]:top-[146px] [@media(max-height:950px)]:bottom-[108px]">
          <div className="border-b-2 border-[#002b9e] pb-[12px] text-center [@media(max-height:950px)]:pb-[8px]">
            <h1 className="text-[24px] font-bold leading-tight text-[#002b9e] md:text-[28px] [@media(max-height:950px)]:text-[21px]">{t("title")}</h1>
            <p className="mx-auto mt-[9px] max-w-[72ch] text-center text-[17px] leading-[1.3] text-[#173846] [@media(max-height:950px)]:mt-[6px] [@media(max-height:950px)]:text-[14px]">
              {t("description")}
            </p>
          </div>

          <div className="mt-[18px] grid min-h-[278px] gap-[12px] border border-[#6295a9] bg-[#cce8f1]/85 p-[12px] md:grid-cols-[1.06fr_1fr_1.05fr] md:items-stretch md:gap-[12px] [@media(max-height:950px)]:mt-[12px] [@media(max-height:950px)]:min-h-[212px] [@media(max-height:950px)]:p-[10px]">
            <div className="flex min-w-0 flex-col">
              <OptionGroup title={groups[0].title} options={groups[0].options} className="flex flex-col" />
            </div>
            <div className="flex min-w-0 flex-col">
              <OptionGroup title={groups[1].title} options={groups[1].options} className="flex flex-col" />
            </div>
            <div className="grid min-w-0 grid-rows-[auto_1fr] gap-[6px]">
              <OptionGroup title={groups[2].title} options={groups[2].options} />
              <OptionGroup title={groups[3].title} options={groups[3].options} className="self-end" />
            </div>
          </div>

          <div className="mt-[18px] grid gap-[12px] md:grid-cols-[1fr_1fr_1fr_1fr] md:gap-[16px] [@media(max-height:950px)]:mt-[12px]">
            {lists.map((list) => (
              <YellowList key={list.key} title={list.title} items={list.items} />
            ))}
            <PeriodPanel title={t("period.title")} rows={periodRows} />
          </div>

          <button
            type="button"
            className="mt-[18px] h-[34px] shrink-0 border border-[#8f7610] bg-[#ffdf32] text-[16px] font-bold leading-none text-[#002b9e] shadow-[2px_2px_0_rgba(0,43,112,0.22)] transition-colors hover:bg-[#ffec70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002b9e] [@media(max-height:950px)]:mt-[12px] [@media(max-height:950px)]:h-[24px] [@media(max-height:950px)]:text-[13px]"
          >
            {t("actions.validate")}
          </button>
        </section>

        <StavnetFooter items={footerItems} className="md:left-[7.2vw] md:right-[7.2vw]" desktopMode="equal" />
      </div>
    </main>
  );
}
