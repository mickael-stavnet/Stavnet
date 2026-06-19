import Image from "next/image";
import { ReactNode } from "react";
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
  if (desktopMode === "cover") {
    return (
      <nav
        data-stavnet-animate="footer"
        className={cn(
          "mt-7 flex flex-col gap-5 pb-2 md:absolute md:left-[5.1vw] md:right-[5.1vw] md:mt-0 md:grid md:grid-cols-[92px_minmax(0,1fr)_92px] md:items-end md:gap-0 md:pb-0",
          className,
        )}
      >
        <Link
          href={items[0].href}
          onClick={items[0].onClick}
          className={cn(
            "flex min-h-[80px] flex-col items-start justify-end text-black md:col-start-1 md:row-start-1",
            itemClassName,
          )}
        >
          <div className="flex h-[48px] w-[68px] items-center justify-center">
            <Image
              src={items[0].icon}
              alt=""
              width={68}
              height={48}
              className="max-h-[48px] w-auto object-contain"
            />
          </div>
          <span className="mt-[8px] block min-h-[16px] text-[15px] font-bold leading-none">
            {items[0].label}
          </span>
        </Link>

        <div className="text-center md:col-start-2 md:row-start-1 md:self-end md:pb-[52px]">
          {centerContent}
        </div>

        <Link
          href={items[1].href}
          onClick={items[1].onClick}
          className={cn(
            "flex min-h-[80px] flex-col items-end justify-end text-black md:col-start-3 md:row-start-1",
            itemClassName,
          )}
        >
          <div className="flex h-[48px] w-[68px] items-center justify-center">
            <Image
              src={items[1].icon}
              alt=""
              width={68}
              height={48}
              className="max-h-[48px] w-auto object-contain"
            />
          </div>
          <span className="mt-[8px] block min-h-[16px] text-[15px] font-bold leading-none">
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
        className={cn(
          "mt-7 grid gap-x-3 gap-y-4 pb-2 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:mt-0 md:grid-cols-4 md:gap-8 md:pb-0",
          mobileGridClassName ?? "grid-cols-4 sm:grid-cols-4",
          className,
        )}
      >
        {itemPairs.map((pair, pairIndex) => (
          <div
            key={`pair-${pairIndex}`}
            className="contents md:grid md:grid-cols-2 md:gap-0"
          >
            {pair.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  "flex min-h-[82px] flex-col items-center justify-end text-center text-[15px] font-bold leading-none text-black",
                  itemClassName,
                )}
              >
                <div className="flex h-[48px] w-[68px] items-center justify-center">
                  <Image
                    src={item.icon}
                    alt=""
                    width={68}
                    height={48}
                    className="max-h-[48px] w-auto object-contain"
                  />
                </div>
                <span className="mt-[8px] block min-h-[16px]">
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
      className={cn(
        "mt-7 grid gap-x-3 gap-y-4 pb-2 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:mt-0 md:pb-0",
        mobileGridClassName ?? "grid-cols-4 sm:grid-cols-4",
        desktopMode === "equal"
          ? "md:grid-flow-col md:auto-cols-fr md:gap-6"
          : "md:flex md:items-end md:justify-between",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          onClick={item.onClick}
          className={cn(
            "flex min-h-[82px] flex-col items-center justify-end text-center text-[15px] font-bold leading-none text-black",
            itemClassName,
          )}
        >
          <div className="flex h-[48px] w-[68px] items-center justify-center">
            <Image
              src={item.icon}
              alt=""
              width={68}
              height={48}
              className="max-h-[48px] w-auto object-contain"
            />
          </div>
          <span className="mt-[8px] block min-h-[16px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
