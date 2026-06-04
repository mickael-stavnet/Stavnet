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
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle>Navigation Language</CardTitle>
        <CardDescription>
          Select your research environment language.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-2">
          {LANGUAGES.map((lang) => (
            <Item
              key={lang.id}
              className="cursor-pointer border-none bg-slate-100/50 hover:bg-slate-100 transition-colors"
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
