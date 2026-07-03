import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-2 rounded-[18px] border border-[#8bbac8] bg-[#dff2f8] px-3 py-2 shadow-[0_10px_24px_rgba(53,97,117,0.16),inset_0_1px_0_rgba(255,255,255,0.7)]",
        className
      )}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size={size}
      className={cn(
        "h-10 min-w-10 rounded-[12px] border border-[#d7bc3f] bg-[linear-gradient(180deg,#fff6ab_0%,#ffe768_46%,#ffd948_100%)] px-3 text-[13px] font-bold text-[#342600] shadow-[0_4px_10px_rgba(163,126,21,0.22),inset_0_1px_0_rgba(255,255,255,0.68)] transition-[transform,box-shadow,background-color,border-color] duration-150 hover:-translate-y-px hover:border-[#c8aa22] hover:bg-[linear-gradient(180deg,#fff8bc_0%,#ffeb78_46%,#ffdd57_100%)] hover:text-[#221800] hover:shadow-[0_8px_16px_rgba(163,126,21,0.26),inset_0_1px_0_rgba(255,255,255,0.74)] active:translate-y-0 data-[active=true]:border-[#5d9cb1] data-[active=true]:bg-[linear-gradient(180deg,#d7f4ff_0%,#9fdcf0_48%,#7dc8df_100%)] data-[active=true]:text-[#0c3445] data-[active=true]:shadow-[0_6px_14px_rgba(54,122,145,0.22),inset_0_1px_0_rgba(255,255,255,0.7)]",
        className
      )}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("min-w-[112px] gap-1.5 px-3.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("min-w-[112px] gap-1.5 px-3.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-10 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        "rounded-[12px] border border-[#d8c05c] bg-[linear-gradient(180deg,#fff9c8_0%,#fff0a8_100%)] text-[#5a4700] shadow-[0_4px_10px_rgba(163,126,21,0.16),inset_0_1px_0_rgba(255,255,255,0.64)]",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
