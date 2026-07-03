"use client";

import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SearchField({
  id,
  name,
  label,
  value,
  onChange,
  className,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-[6px] ${className ?? ""}`}>
      <span className="text-[16px] leading-none text-black md:text-[17px]">
        {label}
      </span>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 rounded-none border-[#78b8cd] bg-[#a9ddf0] px-[8px] text-[16px] font-bold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] focus-visible:border-[#4d8da6] focus-visible:ring-0 md:h-[32px]"
      />
    </label>
  );
}

export default function SearchPageClient() {
  const t = useTranslations("SearchPage");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [personLastName, setPersonLastName] = useState("");
  const [personFirstName, setPersonFirstName] = useState("");
  const [organization, setOrganization] = useState("");
  const [theme, setTheme] = useState("");
  const [publicationLanguage, setPublicationLanguage] = useState("");
  const [year, setYear] = useState("");
  const [generalSearch, setGeneralSearch] = useState("");

  const handleQuit = (e: MouseEvent) => {
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const filters = {
      title,
      personLastName,
      personFirstName,
      organization,
      theme,
      publicationLanguage,
      year,
      generalSearch,
    };

    for (const [key, value] of Object.entries(filters)) {
      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set(key, trimmedValue);
      }
    }

    params.set("page", "1");
    const query = params.toString();
    router.push(query ? `/books?${query}` : "/books");
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

            <form onSubmit={handleSubmit} className="flex flex-col md:w-full md:max-w-[818px]">
              <div className="flex flex-col gap-y-5">
                <SearchField
                  id="search-title"
                  name="title"
                  label={t("labels.title")}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />

                <div className="flex flex-col gap-[8px]">
                  <p className="text-left text-[15px] leading-[1.2] text-black md:text-[16px]">
                    {t("labels.personDescription")}
                  </p>
                  <div className="grid gap-x-[42px] gap-y-3 md:grid-cols-2">
                    <SearchField
                      id="search-person-last-name"
                      name="personLastName"
                      label={t("labels.lastName")}
                      value={personLastName}
                      onChange={(event) => setPersonLastName(event.target.value)}
                    />
                    <SearchField
                      id="search-person-first-name"
                      name="personFirstName"
                      label={t("labels.firstName")}
                      value={personFirstName}
                      onChange={(event) => setPersonFirstName(event.target.value)}
                    />
                  </div>
                </div>

                <SearchField
                  id="search-organization"
                  name="organization"
                  label={t("labels.organizationDescription")}
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                />

                <div className="grid gap-x-[26px] gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_186px] md:items-start">
                  <SearchField
                    id="search-theme"
                    name="theme"
                    label={t("labels.theme")}
                    value={theme}
                    onChange={(event) => setTheme(event.target.value)}
                  />
                  <SearchField
                    id="search-publication-language"
                    name="publicationLanguage"
                    label={t("labels.publicationLanguage")}
                    value={publicationLanguage}
                    onChange={(event) => setPublicationLanguage(event.target.value)}
                  />
                  <SearchField
                    id="search-year"
                    name="year"
                    label={t("labels.year")}
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                  />
                </div>

                <SearchField
                  id="search-general"
                  name="generalSearch"
                  label={t("labels.generalSearch")}
                  value={generalSearch}
                  onChange={(event) => setGeneralSearch(event.target.value)}
                />
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
