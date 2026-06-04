"use client";

import {
  Search,
  Menu,
  X,
  Video,
  Images,
  Volume2,
  BookOpen,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const t = useTranslations('Navbar');

  const NAV_ITEMS = [
    { icon: Search, label: t('search'), href: "/" },
    { icon: Menu, label: t('menu'), href: "/" },
    { icon: Video, label: t('video'), href: "/" },
    { icon: Images, label: t('diaporama'), href: "/" },
    { icon: Volume2, label: t('sound'), href: "/" },
    { icon: BookOpen, label: t('introduction'), href: "/" },
    { icon: HelpCircle, label: t('help'), href: "/" },
    { icon: ChevronRight, label: t('next'), href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-7xl items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-[#1e1e1e] tracking-tight uppercase">
              STAVNET
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 transition-colors hover:text-foreground/80 text-foreground/60"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#1e1e1e] text-white shadow hover:bg-[#1e1e1e]/90 h-9 px-4 py-2"
          >
            <X className="h-4 w-4 mr-2" />
            {t('exit')}
          </Link>
        </div>
      </div>
    </header>
  );
}
