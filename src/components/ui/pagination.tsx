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
        "inline-flex flex-wrap items-center justify-center gap-1.5 rounded-[14px] border border-[#91b7c4] bg-[#e7f4f8] px-2 py-1.5 shadow-[0_6px_14px_rgba(53,97,117,0.12),inset_0_1px_0_rgba(255,255,255,0.72)]",
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
        "size-8 rounded-[10px] border border-[#d1b73f] bg-[linear-gradient(180deg,#fff8c0_0%,#ffe87a_46%,#ffdc57_100%)] px-2 text-[12px] font-semibold leading-none text-[#3a2b00] shadow-[0_3px_8px_rgba(163,126,21,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] transition-[transform,box-shadow,background-color,border-color] duration-150 hover:-translate-y-px hover:border-[#bea321] hover:bg-[linear-gradient(180deg,#fffad0_0%,#fff088_46%,#ffe36e_100%)] hover:text-[#251a00] hover:shadow-[0_6px_12px_rgba(163,126,21,0.22),inset_0_1px_0_rgba(255,255,255,0.76)] active:translate-y-0 data-[active=true]:border-[#6ba7ba] data-[active=true]:bg-[linear-gradient(180deg,#e1f7ff_0%,#b4e3f1_48%,#91cfdf_100%)] data-[active=true]:text-[#0b3445] data-[active=true]:shadow-[0_5px_12px_rgba(54,122,145,0.18),inset_0_1px_0_rgba(255,255,255,0.72)]",
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
      className={cn("min-w-[96px] gap-1 px-2.5 text-[12px]", className)}
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
      className={cn("min-w-[96px] gap-1 px-2.5 text-[12px]", className)}
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
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        "rounded-[10px] border border-[#d9c45f] bg-[linear-gradient(180deg,#fffad2_0%,#fff2b1_100%)] text-[#5a4700] shadow-[0_3px_8px_rgba(163,126,21,0.14),inset_0_1px_0_rgba(255,255,255,0.7)]",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon />
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
