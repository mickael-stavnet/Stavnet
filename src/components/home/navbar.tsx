"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import dynamic from "next/dynamic";

const CommandWrapper = dynamic(() => import("./command-wrapper"), {
  ssr: false,
});

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export function Navbar() {
  const t = useTranslations('Navbar');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const NAV_ITEMS = [
    { label: t('books'), href: "/books" },
    { label: t('organizations'), href: "/orgs" },
    { label: t('authors'), href: "/persons" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center justify-between gap-4 md:min-w-0 md:flex-1">
            <Link href="/" className="shrink-0 font-bold uppercase tracking-tight text-[#1e1e1e]">
              STAVNET
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="flex h-11 min-w-0 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted md:hidden"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">Search...</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-medium md:gap-6 md:pb-0">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="min-h-11 shrink-0 rounded-md px-3 py-2 text-foreground/60 transition-colors hover:bg-muted/70 hover:text-foreground/80"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setOpen(true)}
              className="hidden h-11 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted md:flex md:w-48"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>Search...</span>
              <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandWrapper>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => { setOpen(false); router.push('/books'); }}>{t('books')}</CommandItem>
              <CommandItem onSelect={() => { setOpen(false); router.push('/orgs'); }}>{t('organizations')}</CommandItem>
              <CommandItem onSelect={() => { setOpen(false); router.push('/persons'); }}>{t('authors')}</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandWrapper>
      </CommandDialog>
    </>
  );
}
