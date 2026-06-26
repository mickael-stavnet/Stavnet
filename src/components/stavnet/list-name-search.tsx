"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";

interface ListNameSearchProps {
  label: string;
  placeholder: string;
  initialValue: string;
  resetLabel: string;
}

export function ListNameSearch({ label, placeholder, initialValue, resetLabel }: ListNameSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const currentQuery = (searchParams.get("q") ?? "").trim();
  const currentPage = searchParams.get("page") ?? "1";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedValue = value.trim();
      const hasSameQuery = trimmedValue === currentQuery;
      const isFirstPage = currentPage === "1";

      if (hasSameQuery && isFirstPage) {
        return;
      }

      if (trimmedValue) {
        params.set("q", trimmedValue);
      } else {
        params.delete("q");
      }

      params.set("page", "1");
      const nextQuery = params.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;

      startTransition(() => {
        router.replace(nextHref);
      });
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentPage, currentQuery, pathname, router, searchParams, value]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="list-name-search" className="text-[14px] font-bold leading-none text-black">
        {label}
      </label>
      <Input
        id="list-name-search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        dir="auto"
        className="h-[38px] w-full min-w-0 border-[#7aa8b7] bg-[#f8fbfd] text-[14px] text-black placeholder:text-[#6a7a82] sm:w-[280px] md:w-[320px]"
        autoComplete="off"
        aria-busy={isPending}
      />
      {value.trim() ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="inline-flex h-[38px] items-center justify-center rounded-lg border border-[#7aa8b7] bg-[#f8fbfd] px-4 text-[13px] font-bold text-black"
        >
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}
