"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
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
  const isComposingRef = useRef(false);
  const searchParamsString = searchParams.toString();
  const currentQuery = (searchParams.get("q") ?? "").trim();
  const currentPage = searchParams.get("page") ?? "1";

  const applySearch = useCallback(() => {
    const params = new URLSearchParams(searchParamsString);
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
    const currentHref = searchParamsString ? `${pathname}?${searchParamsString}` : pathname;

    if (nextHref === currentHref) {
      return;
    }

    startTransition(() => {
      router.replace(nextHref);
    });
  }, [currentPage, currentQuery, pathname, router, searchParamsString, startTransition, value]);

  useEffect(() => {
    if (isComposingRef.current) {
      return;
    }

    const trimmedValue = value.trim();
    const hasSameQuery = trimmedValue === currentQuery;
    const isFirstPage = currentPage === "1";

    if (hasSameQuery && isFirstPage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      applySearch();
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [applySearch, currentPage, currentQuery, value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applySearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="list-name-search" className="text-[14px] font-bold leading-none text-black">
        {label}
      </label>
      <Input
        id="list-name-search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(event) => {
          isComposingRef.current = false;
          setValue(event.currentTarget.value);
        }}
        placeholder={placeholder}
        dir="auto"
        className="h-[38px] w-full min-w-0 border-[#7aa8b7] bg-[#f8fbfd] text-[14px] text-black placeholder:text-[#6a7a82] sm:w-[280px] md:w-[320px]"
        autoComplete="off"
        aria-busy={isPending}
      />
      {value.trim() ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            if (currentQuery) {
              startTransition(() => {
                const params = new URLSearchParams(searchParamsString);
                params.delete("q");
                params.set("page", "1");
                const nextQuery = params.toString();
                const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
                router.replace(nextHref);
              });
            }
          }}
          className="inline-flex h-[38px] items-center justify-center rounded-lg border border-[#7aa8b7] bg-[#f8fbfd] px-4 text-[13px] font-bold text-black"
        >
          {resetLabel}
        </button>
      ) : null}
    </form>
  );
}
