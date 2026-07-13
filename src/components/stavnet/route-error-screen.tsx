"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Link } from "@/i18n/routing";

interface RouteErrorScreenProps {
  title: string;
  message: string;
  homeHref: "/" | "/home" | "/books" | "/orgs" | "/persons";
  homeLabel: string;
  retryLabel: string;
  reset: () => void;
  error: Error & { digest?: string };
}

export function RouteErrorScreen({
  title,
  message,
  homeHref,
  homeLabel,
  retryLabel,
  reset,
  error,
}: RouteErrorScreenProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <section className="w-full max-w-[760px] rounded-[10px] border border-[#7aa8b7] bg-[#d8dde2] p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.12)] md:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#07384a]">STAVNET</p>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-black">{title}</h1>
            <p className="mt-4 text-[15px] leading-[1.5] text-[#21323b]">{message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-[42px] items-center justify-center rounded-[8px] border border-[#7aa8b7] bg-[#a7dcee] px-5 text-[14px] font-bold text-black shadow-[2px_2px_4px_rgba(0,0,0,0.12)]"
              >
                {retryLabel}
              </button>
              <Link
                href={homeHref}
                className="inline-flex h-[42px] items-center justify-center rounded-[8px] border border-[#7aa8b7] bg-[#fff8c8] px-5 text-[14px] font-bold text-black shadow-[2px_2px_4px_rgba(0,0,0,0.12)]"
              >
                {homeLabel}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
