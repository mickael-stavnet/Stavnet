"use client";

import Image from "next/image";
import { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface StavnetFooterItem {
  key: string;
  href:
    | "/"
    | "/home"
    | "/menu"
    | "/books/details"
    | "/books/details/back-cover"
    | "/books/details/availability"
    | "/books/details/publishing"
    | "/books/details/press-critiques"
    | "/definition"
    | "/orgs"
    | "/orgs/details"
    | "/persons"
    | "/persons/details"
    | "/search"
    | "/statistics"
    | "/books";
  icon: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface StavnetFooterProps {
  items: StavnetFooterItem[];
  className?: string;
  itemClassName?: string;
  mobileGridClassName?: string;
  desktopMode?: "equal" | "compact" | "cover" | "paired";
  centerContent?: ReactNode;
}

export function StavnetFooter({
  items,
  className,
  itemClassName,
  mobileGridClassName,
  desktopMode = "equal",
  centerContent,
}: StavnetFooterProps) {
  const router = useRouter();
  const itemCount = items.length;
  const compactDesktopGapClass =
    itemCount <= 2
      ? "md:gap-32"
      : itemCount <= 4
        ? "md:gap-24"
        : itemCount <= 6
          ? "md:gap-18"
          : "md:gap-14";

  const handleItemClick = (item: StavnetFooterItem) => (event: MouseEvent) => {
    item.onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (item.key !== "back") {
      return;
    }
    event.preventDefault();
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(item.href);
  };

  if (desktopMode === "cover") {
    return (
      <nav
        data-stavnet-animate="footer"
        suppressHydrationWarning
          className={cn(
            "mt-4 flex flex-col gap-3 pb-2 md:absolute md:bottom-[clamp(14px,3vh,40px)] md:left-[5.1vw] md:right-[5.1vw] md:mt-0 md:grid md:grid-cols-[92px_minmax(0,1fr)_92px] md:items-end md:gap-0 md:pb-0",
            className,
          )}
        >
        <Link
          href={items[0].href}
          onClick={handleItemClick(items[0])}
          className={cn(
            "flex min-h-[64px] flex-col items-start justify-end text-black md:col-start-1 md:row-start-1 md:min-h-[80px] [@media(max-height:950px)]:min-h-[64px]",
            itemClassName,
          )}
        >
          <div className="relative flex h-[40px] w-[56px] items-center justify-center md:h-[48px] md:w-[68px] [@media(max-height:950px)]:h-[40px] [@media(max-height:950px)]:w-[56px]">
            <Image
              src={items[0].icon}
              alt=""
              fill
              sizes="68px"
              className="object-contain"
            />
          </div>
          <span className="mt-[6px] block min-h-[14px] text-[13px] font-bold leading-none md:mt-[8px] md:min-h-[16px] md:text-[15px] [@media(max-height:950px)]:text-[12px]">
            {items[0].label}
          </span>
        </Link>

        <div className="text-center md:col-start-2 md:row-start-1 md:self-end md:pb-[52px] [@media(max-height:950px)]:pb-[36px]">
          {centerContent}
        </div>

        <Link
          href={items[1].href}
          onClick={handleItemClick(items[1])}
          className={cn(
            "flex min-h-[64px] flex-col items-end justify-end text-black md:col-start-3 md:row-start-1 md:min-h-[80px] [@media(max-height:950px)]:min-h-[64px]",
            itemClassName,
          )}
        >
          <div className="relative flex h-[40px] w-[56px] items-center justify-center md:h-[48px] md:w-[68px] [@media(max-height:950px)]:h-[40px] [@media(max-height:950px)]:w-[56px]">
            <Image
              src={items[1].icon}
              alt=""
              fill
              sizes="68px"
              className="object-contain"
            />
          </div>
          <span className="mt-[6px] block min-h-[14px] text-[13px] font-bold leading-none md:mt-[8px] md:min-h-[16px] md:text-[15px] [@media(max-height:950px)]:text-[12px]">
            {items[1].label}
          </span>
        </Link>
      </nav>
    );
  }

  if (desktopMode === "paired") {
    const itemPairs = items.reduce<StavnetFooterItem[][]>(
      (pairs, item, index) => {
        const pairIndex = Math.floor(index / 2);
        pairs[pairIndex] ??= [];
        pairs[pairIndex].push(item);
        return pairs;
      },
      [],
    );

    return (
      <nav
        data-stavnet-animate="footer"
        suppressHydrationWarning
      className={cn(
          "mt-4 grid gap-x-1 gap-y-2 pb-2 md:absolute md:bottom-[clamp(14px,3vh,40px)] md:left-[4.8vw] md:right-[4.8vw] md:mt-0 md:flex md:flex-wrap md:justify-center md:pb-0",
          compactDesktopGapClass,
          mobileGridClassName ?? "grid-cols-4 sm:grid-cols-4",
          className,
        )}
      >
        {itemPairs.map((pair, pairIndex) => (
          <div
            key={`pair-${pairIndex}`}
            className="contents md:flex md:items-end md:gap-12"
          >
            {pair.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={handleItemClick(item)}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-end text-center text-[13px] font-bold leading-none text-black md:min-h-[82px] md:text-[15px] [@media(max-height:950px)]:min-h-[64px] [@media(max-height:950px)]:text-[12px]",
                itemClassName,
              )}
            >
                <div className="relative flex h-[40px] w-[56px] items-center justify-center md:h-[48px] md:w-[68px] [@media(max-height:950px)]:h-[40px] [@media(max-height:950px)]:w-[56px]">
                  <Image
                    src={item.icon}
                    alt=""
                    fill
                    sizes="68px"
                    className="object-contain"
                  />
                </div>
                <span className="mt-[6px] block min-h-[14px] md:mt-[8px] md:min-h-[16px]">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav
      data-stavnet-animate="footer"
      suppressHydrationWarning
        className={cn(
        "mt-4 grid gap-x-1 gap-y-2 pb-2 md:absolute md:bottom-[clamp(14px,3vh,40px)] md:left-[4.8vw] md:right-[4.8vw] md:mt-0 md:pb-0",
        mobileGridClassName ?? "grid-cols-4 sm:grid-cols-4",
        desktopMode === "equal"
          ? `md:flex md:flex-nowrap md:items-end md:justify-center ${compactDesktopGapClass}`
          : `md:flex md:items-end md:justify-center ${compactDesktopGapClass}`,
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          onClick={handleItemClick(item)}
        className={cn(
            "flex min-h-[64px] flex-col items-center justify-end text-center text-[13px] font-bold leading-none text-black md:min-h-[82px] md:text-[15px] [@media(max-height:950px)]:min-h-[64px] [@media(max-height:950px)]:text-[12px]",
            itemClassName,
          )}
        >
          <div className="relative flex h-[40px] w-[56px] items-center justify-center md:h-[48px] md:w-[68px] [@media(max-height:950px)]:h-[40px] [@media(max-height:950px)]:w-[56px]">
            <Image
              src={item.icon}
              alt=""
              fill
              sizes="68px"
              className="object-contain"
            />
          </div>
          <span className="mt-[6px] block min-h-[14px] md:mt-[8px] md:min-h-[16px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
