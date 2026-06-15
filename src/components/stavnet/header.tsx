"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useDateTime } from "@/hooks/use-datetime";
import { cn } from "@/lib/utils";

interface StavnetHeaderProps {
  pageName: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badgeBody?: ReactNode;
  titleExtra?: ReactNode;
  rightControl?: ReactNode;
  headerClassName?: string;
  logoClassName?: string;
  badgeClassName?: string;
  titleBlockClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  rightControlClassName?: string;
}

export function StavnetHeader({
  pageName,
  title,
  subtitle,
  badgeBody,
  titleExtra,
  rightControl,
  headerClassName,
  logoClassName,
  badgeClassName,
  titleBlockClassName,
  titleClassName,
  subtitleClassName,
  rightControlClassName,
}: StavnetHeaderProps) {
  const { date, time } = useDateTime();

  return (
    <header
      data-stavnet-animate="header"
      className={cn(
        "relative flex flex-col items-center gap-4 md:absolute md:left-0 md:top-0 md:h-[146px] md:w-full md:block",
        headerClassName,
      )}
    >
      <div
        className={cn(
          "md:absolute md:left-[4.9vw] md:top-[2.8vh] md:w-[255px]",
          logoClassName,
        )}
      >
        <Image
          src="/icons/logo/logo-stavnet.png"
          alt="STAVNET"
          width={295}
          height={75}
          priority
          className="h-auto w-[220px] md:w-full"
        />
      </div>

      <section
        className={cn(
          "flex h-[110px] w-[208px] flex-col items-center justify-center overflow-hidden rounded-bl-[14px] rounded-br-[14px] bg-[radial-gradient(circle_at_68%_24%,#fff46c_0%,#ffe32d_24%,#ffa51a_51%,#c93623_74%,#3f2f7f_100%)] text-center shadow-[9px_3px_11px_rgba(0,0,0,0.42)] md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2",
          badgeClassName,
        )}
      >
        <div className="font-serif text-[25px] font-bold italic leading-none text-[#0018c9]">
          {pageName}
        </div>
        {badgeBody ? (
          <div className="mt-[6px]">{badgeBody}</div>
        ) : (
          <>
            <p className="mt-2 text-[12px] font-bold leading-none text-black">
              {date}
            </p>
            <p className="mt-1 text-[12px] font-bold leading-none text-black">
              {time}
            </p>
          </>
        )}
      </section>

      <section
        className={cn(
          "text-center md:absolute md:right-[4.9vw] md:top-[2.7vh] md:w-[41vw] md:text-right",
          titleBlockClassName,
        )}
      >
        <h1
          className={cn(
            "font-serif text-[31px] font-bold italic leading-none text-[#0018c9] md:text-[32px]",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <>
            <div className="ml-auto mt-[8px] h-[3px] w-full max-w-[402px] bg-[#ffcf19]" />
            <p
              className={cn(
                "mt-[6px] text-[17px] font-bold leading-none text-[#0018c9]",
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          </>
        ) : null}
        {titleExtra}
      </section>

      {rightControl ? (
        <div
          className={cn(
            "relative z-30 md:absolute md:right-[4.9vw] md:top-[118px]",
            rightControlClassName,
          )}
        >
          {rightControl}
        </div>
      ) : null}
    </header>
  );
}
