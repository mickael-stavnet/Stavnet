"use client";

import type { BookTableOfContentsEntry } from "@/lib/admin-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableOfContentsEditorProps {
  entries: BookTableOfContentsEntry[];
  onChange: (entries: BookTableOfContentsEntry[]) => void;
}

const emptyEntry = (): BookTableOfContentsEntry => ({
  entryType: "nouvelle",
  title: "",
  page: "",
  authorLastName: "",
  authorFirstName: "",
  authorWritingLanguage: "",
  translatorLastName: "",
  translatorFirstName: "",
  translatorLanguage: "",
});

export function TableOfContentsEditor({ entries, onChange }: TableOfContentsEditorProps) {
  const updateEntry = (index: number, field: keyof BookTableOfContentsEntry, value: string) => {
    onChange(entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry));
  };

  return (
    <Card id="table-des-matieres">
      <CardHeader>
        <CardTitle>Table des matières</CardTitle>
        <CardDescription>Ajoutez chaque nouvelle ou élément éditorial. Les informations d’auteur et de traduction sont facultatives.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {entries.map((entry, index) => (
          <section key={index} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium">Entrée {index + 1}</h2>
              <Button type="button" variant="ghost" onClick={() => onChange(entries.filter((_, entryIndex) => entryIndex !== index))}>Retirer</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`toc-title-${index}`}>Titre</Label>
                <Input id={`toc-title-${index}`} value={entry.title} onChange={(event) => updateEntry(index, "title", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`toc-page-${index}`}>Page de début</Label>
                <Input id={`toc-page-${index}`} value={entry.page} onChange={(event) => updateEntry(index, "page", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={entry.entryType} onValueChange={(value) => updateEntry(index, "entryType", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nouvelle">Nouvelle</SelectItem>
                    <SelectItem value="avant-propos">Avant-propos</SelectItem>
                    <SelectItem value="introduction">Introduction</SelectItem>
                    <SelectItem value="bibliographie">Bibliographie</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Auteur</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Input aria-label={`Nom de l’auteur ${index + 1}`} placeholder="Nom" value={entry.authorLastName} onChange={(event) => updateEntry(index, "authorLastName", event.target.value)} />
                <Input aria-label={`Prénom de l’auteur ${index + 1}`} placeholder="Prénom" value={entry.authorFirstName} onChange={(event) => updateEntry(index, "authorFirstName", event.target.value)} />
                <Input aria-label={`Langue d’écriture ${index + 1}`} placeholder="Langue d’écriture" value={entry.authorWritingLanguage} onChange={(event) => updateEntry(index, "authorWritingLanguage", event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Traducteur</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Input aria-label={`Nom du traducteur ${index + 1}`} placeholder="Nom" value={entry.translatorLastName} onChange={(event) => updateEntry(index, "translatorLastName", event.target.value)} />
                <Input aria-label={`Prénom du traducteur ${index + 1}`} placeholder="Prénom" value={entry.translatorFirstName} onChange={(event) => updateEntry(index, "translatorFirstName", event.target.value)} />
                <Input aria-label={`Langue du traducteur ${index + 1}`} placeholder="Langue" value={entry.translatorLanguage} onChange={(event) => updateEntry(index, "translatorLanguage", event.target.value)} />
              </div>
            </div>
          </section>
        ))}
        <Button type="button" variant="outline" onClick={() => onChange([...entries, emptyEntry()])}>Ajouter une entrée</Button>
      </CardContent>
    </Card>
  );
}
