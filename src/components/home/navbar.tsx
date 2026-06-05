"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
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
    { label: t('books'), href: "/" },
    { label: t('organizations'), href: "/orgs" },
    { label: t('authors'), href: "/" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-7xl items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-[#1e1e1e] tracking-tight uppercase">
              STAVNET
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md bg-muted/50 hover:bg-muted text-muted-foreground w-48"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">Ctrl</span>K
            </kbd>
          </button>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandWrapper>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>{t('books')}</CommandItem>
              <CommandItem onSelect={() => { setOpen(false); router.push('/orgs'); }}>{t('organizations')}</CommandItem>
              <CommandItem>{t('authors')}</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandWrapper>
      </CommandDialog>
    </>
  );
}
