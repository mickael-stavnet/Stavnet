"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Item,
  ItemGroup,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface Language {
  id: string;
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
  const t = useTranslations("Home");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onLanguageSelect(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle>{t("selectLanguage")}</CardTitle>
        <CardDescription>{t("selectLanguageDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-2">
          {LANGUAGES.map((lang) => (
            <Item
              key={lang.id}
              onClick={() => onLanguageSelect(lang.id)}
              className={cn(
                "cursor-pointer border-none transition-colors",
                locale === lang.id
                  ? "bg-slate-200 hover:bg-slate-200"
                  : "bg-slate-100/50 hover:bg-slate-100",
              )}
              size="default"
            >
              <ItemContent>
                <ItemTitle className="font-semibold">{lang.native}</ItemTitle>
                <ItemDescription className="text-xs">
                  {lang.english}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
