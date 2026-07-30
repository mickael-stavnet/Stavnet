"use client";

import Image from "next/image";
import { Home, Menu, SearchX, Undo2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface NotFoundScreenProps {
  title: string;
  message: string;
  homeLabel: string;
  menuLabel: string;
  backLabel: string;
}

export function NotFoundScreen({ title, message, homeLabel, menuLabel, backLabel }: NotFoundScreenProps) {
  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-[#102a35] md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(229,247,251,0.28),rgba(207,233,241,0.18))]" />
      <section className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[720px] flex-col items-center justify-center px-5 py-10 text-center">
        <p className="font-serif text-[clamp(5.25rem,15vw,9.5rem)] font-bold leading-none tracking-[-0.04em] text-[#0b6680] [text-shadow:0_3px_0_#fdf9d6,0_6px_12px_rgba(21,78,96,0.2)]">
          404
        </p>
        <div className="mt-3 flex size-12 items-center justify-center rounded-lg bg-[#d9f0f5] text-[#0b6680] ring-1 ring-[#7bb8c8]">
          <SearchX aria-hidden="true" className="size-6" strokeWidth={2.25} />
        </div>
        <h1 className="mt-5 text-balance text-[28px] font-bold leading-tight text-[#102a35] sm:text-[34px]">{title}</h1>
        <p className="mt-3 max-w-[58ch] text-pretty text-[16px] leading-7 text-[#294651]">{message}</p>
        <div className="mt-7 flex w-full max-w-[410px] flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-11 bg-[#0b6b85] px-5 font-bold text-white hover:bg-[#07566c] focus-visible:ring-[#0b6b85]/35">
            <Link href="/">
              <Home aria-hidden="true" />
              {homeLabel}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 border-[#76aebb] bg-[#fdf9d6] px-5 font-bold text-[#173b46] hover:bg-[#fff3a6] focus-visible:ring-[#0b6b85]/35">
            <Link href="/menu">
              <Menu aria-hidden="true" />
              {menuLabel}
            </Link>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => window.history.go(-1)} className="h-11 border-[#76aebb] bg-[#f7fcfd] px-5 font-bold text-[#173b46] hover:bg-[#e8f5f8] focus-visible:ring-[#0b6b85]/35">
            <Undo2 aria-hidden="true" />
            {backLabel}
          </Button>
        </div>
      </section>
    </main>
  );
}
