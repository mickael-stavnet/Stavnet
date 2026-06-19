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
        "relative flex justify-center px-0 pt-0 md:absolute md:left-0 md:top-0 md:h-[146px] md:w-full md:block md:px-0",
        headerClassName,
      )}
    >
      <div
        className={cn(
          "hidden md:absolute md:left-[4.9vw] md:top-[8px] md:block md:w-[255px]",
          logoClassName,
        )}
      >
        <Image
          src="/icons/logo/logo-stavnet.png"
          alt="STAVNET"
          width={295}
          height={75}
          priority
          className="h-auto w-[104px] md:w-[114px]"
        />
      </div>

      <section
        className={cn(
          "flex h-[88px] w-[212px] flex-col items-center justify-center overflow-hidden rounded-b-[14px] bg-[radial-gradient(circle_at_68%_24%,#fff46c_0%,#ffe32d_24%,#ffa51a_51%,#c93623_74%,#3f2f7f_100%)] px-3 text-center shadow-[9px_3px_11px_rgba(0,0,0,0.42)] md:absolute md:left-1/2 md:top-0 md:h-[110px] md:w-[208px] md:-translate-x-1/2 md:rounded-bl-[14px] md:rounded-br-[14px] md:px-0",
          badgeClassName,
        )}
      >
        <div className="font-serif text-[18px] font-bold italic leading-[0.98] text-[#0018c9] md:text-[25px]">
          {pageName}
        </div>
        {badgeBody ? (
          <div className="mt-[6px]">{badgeBody}</div>
        ) : (
          <>
            <p className="mt-2 text-[11px] font-bold leading-none text-black md:text-[12px]">
              {date}
            </p>
            <p className="mt-1 text-[11px] font-bold leading-none text-black md:text-[12px]">
              {time}
            </p>
          </>
        )}
      </section>

      <section
        className={cn(
          "hidden md:absolute md:right-[4.9vw] md:top-[2.7vh] md:block md:w-[41vw] md:text-right",
          titleBlockClassName,
        )}
      >
        <h1
          className={cn(
            "font-serif text-[26px] font-bold italic leading-[1.04] text-[#0018c9] md:text-[32px] md:leading-none",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <>
            <div className="mx-auto mt-[8px] h-[3px] w-full max-w-[300px] bg-[#ffcf19] md:ml-auto md:mr-0 md:max-w-[402px]" />
            <p
              className={cn(
                "mt-[6px] text-[15px] font-bold leading-[1.15] text-[#0018c9] md:text-[17px] md:leading-none",
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
            "hidden md:absolute md:right-[4.9vw] md:top-[118px] md:block md:max-w-none",
            rightControlClassName,
          )}
        >
          {rightControl}
        </div>
      ) : null}
    </header>
  );
}
