"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

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
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-[#102a35] md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(229,247,251,0.28),rgba(207,233,241,0.18))]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <div className="flex flex-1 items-center justify-center px-2 py-10 sm:px-4">
          <Card className="w-full max-w-[560px] gap-0 overflow-hidden rounded-xl bg-[#f7fcfd]/95 py-0 text-[#102a35] shadow-[0_8px_8px_rgba(21,78,96,0.18)] ring-[#4d91a6]">
            <CardHeader className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
              <div className="row-span-2 flex size-11 items-center justify-center rounded-lg bg-[#d9f0f5] text-[#0b6680] ring-1 ring-[#7bb8c8]">
                <TriangleAlert aria-hidden="true" className="size-5" strokeWidth={2.25} />
              </div>
              <p className="self-end text-xs font-bold tracking-[0.06em] text-[#0a5368]">STAVNET</p>
              <h1 className="text-balance font-[Arial,Helvetica,sans-serif] text-[25px] font-bold leading-tight text-[#102a35] sm:text-[29px]">
                {title}
              </h1>
            </CardHeader>
            <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
              <p className="max-w-[63ch] text-[15px] leading-6 text-[#294651]">{message}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3 border-t-0 bg-[#e8f5f8] px-6 py-4 sm:flex-row sm:px-8">
              <Button
                type="button"
                onClick={reset}
                size="lg"
                className="h-10 justify-center bg-[#0b6b85] px-4 font-bold text-white hover:bg-[#07566c] focus-visible:ring-[#0b6b85]/35 sm:justify-start"
              >
                <RefreshCw aria-hidden="true" />
                {retryLabel}
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-10 justify-center border-[#76aebb] bg-[#fdf9d6] px-4 font-bold text-[#173b46] hover:bg-[#fff3a6] focus-visible:ring-[#0b6b85]/35 sm:justify-start"
              >
                <Link href={homeHref}>
                  <Home aria-hidden="true" />
                  {homeLabel}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
