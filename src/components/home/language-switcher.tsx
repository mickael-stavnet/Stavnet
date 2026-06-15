"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

const LANGUAGES = [
  { id: "fr", label: "Francais", flag: "/icons/flags/french.jpg" },
  { id: "en", label: "English", flag: "/icons/flags/english.gif" },
  { id: "he", label: "Hebreu", flag: "/icons/flags/hebrew.jpg" },
  { id: "ar", label: "Arabe", flag: "/icons/flags/arab.jpg" },
  { id: "es", label: "Espanol", flag: "/icons/flags/spanish.jpg" },
  { id: "de", label: "Deutsch", flag: "/icons/flags/german.jpg" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);

  const currentLanguage =
    LANGUAGES.find((language) => language.id === locale) ?? LANGUAGES[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function cancelClose() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimeoutRef.current = null;
    }, 180);
  }

  function handleLanguageChange(nextLocale: (typeof LANGUAGES)[number]["id"]) {
    cancelClose();
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div
      ref={rootRef}
      className="relative z-30 w-[150px] self-center"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onPointerEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onPointerLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => {
          cancelClose();
          setOpen((value) => !value);
        }}
        className="flex h-[40px] w-full items-center justify-between rounded-[6px] border border-[#bca86f] bg-[#e3ce96] px-4 text-[13px] font-medium text-[#1d3964] shadow-[0_1px_4px_rgba(82,67,25,0.18)] transition-colors hover:bg-[#e8d6a6]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2.5">
          <Image
            src={currentLanguage.flag}
            alt=""
            width={20}
            height={14}
            className="h-[14px] w-[20px] rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(24,43,69,0.12)]"
          />
          <span>{currentLanguage.label}</span>
        </span>
        <span
          className={`text-[11px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[40px] w-full overflow-hidden rounded-[6px] border border-[#bca86f] bg-[#ecddb4] shadow-[0_4px_14px_rgba(45,41,20,0.18)]"
          role="listbox"
        >
          {LANGUAGES.map((language) => (
            <button
              key={language.id}
              type="button"
              onClick={() => handleLanguageChange(language.id)}
              className={`flex h-[36px] w-full items-center gap-2.5 px-4 text-left text-[13px] text-[#1d3964] transition-colors ${
                language.id === locale
                  ? "bg-[#d9c17d] font-semibold"
                  : "hover:bg-[#e5d3a1]"
              }`}
            >
              <Image
                src={language.flag}
                alt=""
                width={20}
                height={14}
                className="h-[14px] w-[20px] rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(24,43,69,0.12)]"
              />
              <span>{language.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
