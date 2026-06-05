"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Item, ItemGroup, ItemTitle, ItemContent, ItemDescription } from "@/components/ui/item";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { cn } from "@/lib/utils";

// Drapeaux minimalistes en SVG
const Flags = {
  fr: () => <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm"><path fill="#002654" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ce1126" d="M2 0h1v2H2z"/></svg>,
  en: () => <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm"><path fill="#012169" d="M0 0h3v2H0z"/><path fill="#fff" d="M0 0h3v1H0zM1 0h1v2H1z"/><path fill="#C8102E" d="M1 0h1v1H0v1h1zM2 1h1v1H2zM0 1h1v1H0z"/></svg>,
  he: () => <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm"><rect width="3" height="2" fill="#fff"/><rect width="3" height="0.4" y="0.2" fill="#0038b8"/><rect width="3" height="0.4" y="1.4" fill="#0038b8"/><path d="M1.2 0.7h0.6v0.6H1.2z" fill="#0038b8"/></svg>,
  ar: () => <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm"><path fill="#ce1126" d="M0 0h3v2H0z"/><path fill="#fff" d="M0 0.66h3v0.67H0z"/><path fill="#000" d="M0 1.33h3v0.67H0z"/></svg>,
  es: () => <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm"><path fill="#AA151B" d="M0 0h3v2H0z"/><path fill="#F1BF00" d="M0 0.5h3v1H0z"/></svg>,
  de: () => <svg viewBox="0 0 3 2" className="h-4 w-6 rounded-sm"><path fill="#000" d="M0 0h3v0.67H0z"/><path fill="#D00" d="M0 0.67h3v0.66H0z"/><path fill="#FFCE00" d="M0 1.33h3v0.67H0z"/></svg>,
};

interface Language {
  id: keyof typeof Flags;
  native: string;
  english: string;
}

const LANGUAGES: Language[] = [
  { id: "fr", native: "Français", english: "French" },
  { id: "en", native: "Anglais", english: "English" },
  { id: "he", native: "Hébreu", english: "Hebrew" },
  { id: "ar", native: "Arabe", english: "Arabic" },
  { id: "es", native: "Espagnol", english: "Spanish" },
  { id: "de", native: "Allemand", english: "German" },
];

export function LanguageTable() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onLanguageSelect(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <Card className="border-border shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('selectLanguage')}</CardTitle>
        <CardDescription className="text-xs">{t('selectLanguageDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-0">
          {LANGUAGES.map((lang) => {
            const Flag = Flags[lang.id];
            return (
              <Item 
                key={lang.id} 
                onClick={() => onLanguageSelect(lang.id)}
                className={cn(
                  "cursor-pointer transition-colors px-3 py-2 border-none rounded-md",
                  locale === lang.id 
                    ? "bg-slate-100" 
                    : "hover:bg-slate-50"
                )} 
              >
                <div className="flex items-center gap-3">
                  <Flag />
                  <ItemContent>
                    <ItemTitle className="text-sm font-medium">{lang.native}</ItemTitle>
                    <ItemDescription className="text-xs text-muted-foreground">{lang.english}</ItemDescription>
                  </ItemContent>
                </div>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
