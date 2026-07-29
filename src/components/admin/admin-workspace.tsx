"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  Building2,
  ChevronsUpDown,
  Eye,
  FilePlus2,
  History,
  Home,
  Loader2,
  LockKeyhole,
  Pencil,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminEntityType,
  AdminLogEntry,
  AdminPageResult,
  AdminRecord,
  BookTableOfContentsEntry,
} from "@/lib/admin-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TableOfContentsEditor } from "@/components/admin/table-of-contents-editor";

const COLLECTIVE_BOOK_FIELD = "Ouvrage collectif";
const BOOK_ORIGINAL_TITLE_FIELD = "Titre. Original";
const BOOK_TRANSCRIPTION_TITLE_FIELD = "Titre. Transcription";
const HIDDEN_BOOK_FIELD_KEYS = new Set([
  "autreorganisme01 datemaj",
  "autreorganisme01 typelibelle",
  "codeedition",
  "codemanuscrit",
  "codepaysparution1",
  "editeur 1 ville",
  "nombrepages",
  "resume",
]);
const BOOK_ADDITIONAL_FIELDS = ["Éditeur. 2. Collection"];

function isCollectiveBook(payload: Record<string, unknown>): boolean {
  const value = payload[COLLECTIVE_BOOK_FIELD];
  return value === true || value === "true" || value === "Oui";
}

const BOOK_FIELD_ORDER = new Map<string, number>([
  ["titre", 1],
  ["sous titre", 2],
  ["sous titre anglais", 3],
  ["sous titre original", 4],
  ["sous titre transcription", 5],
  ["editeur 1 nom", 101],
  ["editeur 1 collection", 102],
  ["editeur 1 isbn", 103],
  ["editeur 1 pays", 104],
  ["editeur 2 nom", 105],
  ["editeur 2 collection", 106],
  ["isbn", 107],
  ["editeur 2 pays", 108],
  ["prix $", 109],
  ["prix €", 110],
  ["prix public", 111],
  ["reliure", 112],
  ["auteur 1 nom", 201],
  ["auteur 1 prenom", 202],
  ["auteur 1 langue", 203],
  ["auteur 1 type", 204],
  ["auteur 2 nom", 205],
  ["auteur 2 prenom", 206],
  ["auteur 2 langue", 207],
  ["auteur 2 type", 208],
  ["auteur 3 nom", 209],
  ["auteur 3 prenom", 210],
  ["auteur 3 langue", 211],
  ["auteur 3 type", 212],
  ["contrib 1 nom", 301],
  ["contrib 1 prenom", 302],
  ["contrib 1 genre/langue", 303],
  ["contrib 2 nom", 304],
  ["contrib 2 prenom", 305],
  ["contrib 2 genre/langue", 306],
  ["contrib 3 nom", 307],
  ["contrib 3 prenom", 308],
  ["contrib 3 genre/langue", 309],
  ["biblio 1 nom", 401],
  ["biblio 1 ville", 402],
  ["biblio 1 cote", 403],
  ["biblio 2 nom", 404],
  ["biblio 2 ville", 405],
  ["biblio 2 cote", 406],
  ["biblio 3 nom", 407],
  ["biblio 3 ville", 408],
  ["biblio 3 cote", 409],
]);

const labels: Record<AdminEntityType, string> = {
  books: "Livres",
  persons: "Personnes",
  organizations: "Organisations",
};
const personRoles = [
  "auteur",
  "coauteur",
  "traducteur",
  "adaptateur",
  "préfacier",
  "postfacier",
  "illustrateur",
  "éditeur scientifique",
  "directeur de publication",
  "contributeur",
  "autre",
];
const organizationRoles = [
  "éditeur",
  "coéditeur",
  "diffuseur",
  "distributeur",
  "bibliothèque",
  "institution",
  "association",
  "organisme partenaire",
  "autre",
];

type EntityLink = {
  personId?: number;
  organizationId?: number;
  role: string;
  label: string;
  archived: boolean;
};

type QuickFilter = {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
};

const quickFilters: Record<AdminEntityType, QuickFilter[]> = {
  books: [
    {
      key: "language",
      label: "Langue",
      options: [
        { label: "Hébreu", value: "Hébreu" },
        { label: "Anglais", value: "Anglais" },
        { label: "Français", value: "Français" },
      ],
    },
    {
      key: "genre",
      label: "Genre",
      options: [
        { label: "Prose", value: "Prose" },
        { label: "Jeunesse", value: "Livres pour jeunes" },
        { label: "Humour", value: "Humour" },
        { label: "Poésie", value: "Poésie" },
        { label: "Théâtre", value: "Théâtre" },
      ],
    },
    {
      key: "topic",
      label: "Thème",
      options: [
        { label: "Holocauste", value: "Holocauste" },
        { label: "Policier", value: "Policier" },
        { label: "Bible", value: "Bible" },
      ],
    },
  ],
  persons: [
    {
      key: "type",
      label: "Type",
      options: [{ label: "Auteur", value: "Auteur" }],
    },
    {
      key: "language",
      label: "Langue d’écriture",
      options: [
        { label: "Hébreu", value: "Hébreu" },
        { label: "Russe", value: "Russe" },
        { label: "Arabe", value: "Arabe" },
        { label: "Anglais", value: "Anglais" },
      ],
    },
  ],
  organizations: [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Éditeur", value: "Editeur" },
        { label: "Autre organisme", value: "AutreOrganisme" },
      ],
    },
    {
      key: "country",
      label: "Pays",
      options: [
        { label: "France", value: "France" },
        { label: "Allemagne", value: "Allemagne" },
        { label: "États-Unis", value: "Etats-Unis" },
        { label: "Royaume-Uni", value: "Royaume-Uni" },
        { label: "Pays-Bas", value: "Pays-Bas" },
      ],
    },
  ],
};

function api(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`/api/admin/${path}`, {
    cache: "no-store",
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
}

function readable(key: string): string {
  return key.replaceAll(".", " · ").replaceAll("_", " ");
}

function fieldLabel(field: string): string {
  const value = normalizedFieldKey(field);
  if (value === "isbn") return "Éditeur 2 ISBN";
  const authorLanguage = value.match(/^auteur ([1-9]) langue$/);
  if (authorLanguage) return `Auteur ${authorLanguage[1]} langue d’écriture`;
  const contributorGenre = value.match(/^contrib ([1-9]) genre\/langue$/);
  if (contributorGenre) return `Contributeur ${contributorGenre[1]} genre`;
  return readable(field);
}

function normalizedFieldKey(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isHiddenBookAdminField(field: string): boolean {
  const value = normalizedFieldKey(field);
  if (
    field === BOOK_ORIGINAL_TITLE_FIELD ||
    field === BOOK_TRANSCRIPTION_TITLE_FIELD
  )
    return true;
  if (/^contrib (?:[4-9]|10)\b/.test(value)) return true;
  if (/^contrib [1-3] langue traduite$/.test(value)) return true;
  if (/^biblio 4\b/.test(value)) return true;
  if (/^biblio [1-3] (source|type)$/.test(value)) return true;
  return HIDDEN_BOOK_FIELD_KEYS.has(value);
}

function shouldDisplayAdminPayloadField(
  entityType: AdminEntityType,
  field: string,
): boolean {
  return (
    entityType !== "books" ||
    (field !== COLLECTIVE_BOOK_FIELD && !isHiddenBookAdminField(field))
  );
}

function compareAdminFields(
  entityType: AdminEntityType,
  [left]: [string, unknown],
  [right]: [string, unknown],
): number {
  const sectionOrder = fieldSection(entityType, left).localeCompare(
    fieldSection(entityType, right),
    "fr",
  );
  if (sectionOrder !== 0) return sectionOrder;
  if (entityType === "books") {
    const leftOrder = BOOK_FIELD_ORDER.get(normalizedFieldKey(left));
    const rightOrder = BOOK_FIELD_ORDER.get(normalizedFieldKey(right));
    if (leftOrder !== undefined || rightOrder !== undefined)
      return (leftOrder ?? Number.MAX_SAFE_INTEGER) - (rightOrder ?? Number.MAX_SAFE_INTEGER);
  }
  return fieldLabel(left).localeCompare(fieldLabel(right), "fr");
}

function fieldSection(entityType: AdminEntityType, field: string): string {
  const value = field
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
  if (entityType === "books") {
    if (/(resume|sommaire|quatrieme|contenu|description)/.test(value))
      return "Contenu";
    if (/(biblio|cote|source)/.test(value)) return "Bibliothèques";
    if (/(organisme)/.test(value)) return "Organisations liées";
    if (/(code|poids)/.test(value)) return "Références techniques";
    if (
      /(editeur|edition|collection|prix|reliure|pages|dimension|isbn|publication|ville|pays)/.test(
        value,
      )
    )
      return "Publication";
    if (
      /(auteur|contrib|traducteur|illustrateur|prefacier|postfacier|adaptateur|directeur)/.test(
        value,
      )
    )
      return "Auteurs";
    if (/(titre|langue|annee|genre|categorie|theme|rubrique)/.test(value))
      return "Ouvrage";
  }
  if (entityType === "persons") {
    if (
      /(biographie|naissance|deces|residence|activite|profession)/.test(value)
    )
      return "Informations biographiques";
    if (/(annee publication|cote livre)/.test(value) || value.startsWith("nb"))
      return "Publications et statistiques";
    if (/(langue|litter|auteur original|titre)/.test(value))
      return "Informations littéraires";
    if (/(prenom|nom|type|alternatif)/.test(value)) return "Identité";
  }
  if (entityType === "organizations") {
    if (value.startsWith("nb") || /statistique/.test(value))
      return "Statistiques";
    if (/(organisme|nom|synonyme|type|pays|ville|creation)/.test(value))
      return "Identité";
  }
  return "Autres informations importées";
}

const creationSectionOrder: Record<AdminEntityType, string[]> = {
  books: [
    "Ouvrage",
    "Publication",
    "Auteurs",
    "Contenu",
    "Bibliothèques",
    "Organisations liées",
    "Références techniques",
    "Autres informations importées",
  ],
  persons: [
    "Identité",
    "Informations biographiques",
    "Informations littéraires",
    "Publications et statistiques",
    "Autres informations importées",
  ],
  organizations: ["Identité", "Statistiques", "Autres informations importées"],
};

function isLongFormField(field: string, value: unknown): boolean {
  return (
    String(value ?? "").length > 150 ||
    /(résumé|sommaire|quatrième|contenu|description|biographie)/i.test(field)
  );
}

function AdminPayloadField({
  field,
  value,
  onChange,
}: {
  field: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  const multiline = isLongFormField(field, value);
  const contributorGenre = /^contrib [1-3] genre\/langue$/.test(
    normalizedFieldKey(field),
  );
  const bibliographyCote = /^biblio [1-3] cote$/.test(
    normalizedFieldKey(field),
  );
  return (
    <div
      className={
        multiline || contributorGenre || bibliographyCote ? "md:col-span-2" : ""
      }
    >
      <Label className="mb-2 block text-sm" htmlFor={field}>
        {fieldLabel(field)}
      </Label>
      <InputGroup className={multiline ? "min-h-28" : "min-h-11"}>
        {multiline ? (
          <InputGroupTextarea
            id={field}
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <InputGroupInput
            id={field}
            dir={field === "Nom Auteur Hébreu" ? "rtl" : undefined}
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </InputGroup>
    </div>
  );
}

function AdminSidebar({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  const navigation = [
    { href: "/admin", label: "Vitrine des auteurs", icon: Sparkles },
    { href: "/admin/books", label: "Livres", icon: BookOpen },
    { href: "/admin/persons", label: "Personnes", icon: Users },
    { href: "/admin/organizations", label: "Organisations", icon: Building2 },
    { href: "/admin/search", label: "Recherche globale", icon: Search },
    { href: "/admin/trash", label: "Corbeille", icon: Archive },
    { href: "/admin/logs", label: "Historique", icon: History },
  ];
  return (
    <Sidebar collapsible="icon" className="[--sidebar-width:18rem] border-r border-zinc-200">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white"><Shield className="size-4" /></span>
              <span className="font-semibold tracking-tight">STAVNET Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon className="size-[18px]" strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Page d’accueil">
              <Link href="/en">
                <Home className="size-[18px]" strokeWidth={1.8} />
                <span>Page d’accueil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Se déconnecter">
              <LockKeyhole className="size-[18px]" strokeWidth={1.8} />
              <span>Se déconnecter</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Frame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    void fetch("/api/admin/auth", { cache: "no-store" })
      .then((response) => response.json())
      .then((value: { authenticated?: boolean }) => {
        if (value.authenticated) setChecking(false);
        else router.replace("/admin");
      })
      .catch(() => router.replace("/admin"));
  }, [router]);
  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin");
    router.refresh();
  }
  if (checking)
    return (
      <main className="flex min-h-svh items-center justify-center">
        <Skeleton className="h-10 w-52" />
      </main>
    );
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar pathname={pathname} onLogout={() => void logout()} />
        <SidebarInset className="min-w-0 overflow-x-hidden bg-zinc-50">
          <header className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-5 lg:px-8">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <ChevronsUpDown className="size-4 text-zinc-400" />
                <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/en">
                  <Eye className="size-4" />
                  Voir le site
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex min-w-0 flex-1 flex-col p-5 lg:p-8 xl:p-10">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function Pager({
  result,
  page,
  setPage,
}: {
  result: AdminPageResult | null;
  page: number;
  setPage: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t pt-5">
      <Button
        className="min-h-11 text-base"
        variant="outline"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Précédent
      </Button>
      <span className="text-base text-muted-foreground">
        Page {result?.page ?? page} / {result?.totalPages ?? "…"}
      </span>
      <Button
        className="min-h-11 text-base"
        variant="outline"
        disabled={!result || page >= result.totalPages}
        onClick={() => setPage(page + 1)}
      >
        Suivant
      </Button>
    </div>
  );
}

export function AdminEntityList({
  entityType,
  archived = false,
}: {
  entityType: AdminEntityType;
  archived?: boolean;
}) {
  const [result, setResult] = useState<AdminPageResult | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const title = archived
    ? `Corbeille — ${labels[entityType]}`
    : labels[entityType];
  const filterDefinitions = quickFilters[entityType];
  useEffect(() => {
    let live = true;
    const parameters = new URLSearchParams({
      page: String(page),
      q: query,
      status: archived ? "archived" : "active",
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) parameters.set(key, value.trim());
    });
    void api(`${entityType}?${parameters.toString()}`)
      .then(async (response) => {
        const value: unknown = await response.json();
        if (!response.ok)
          throw new Error(
            typeof value === "object" && value !== null && "error" in value
              ? String(value.error)
              : "Chargement impossible",
          );
        if (live) {
          setResult(value as AdminPageResult);
          setError("");
        }
      })
      .catch(
        (caught: unknown) =>
          live &&
          setError(
            caught instanceof Error ? caught.message : "Chargement impossible",
          ),
      );
    return () => {
      live = false;
    };
  }, [archived, entityType, filters, page, query]);
  return (
    <Frame title={title}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-base text-muted-foreground">
              Recherche, filtres et pagination côté serveur.
            </p>
          </div>
          {!archived && (
            <Button className="min-h-12 px-5 text-base" asChild>
              <Link href={`/admin/${entityType}/new`}>
                <FilePlus2 className="size-5" />
                Créer une fiche
              </Link>
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative min-w-64 flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-12 pl-11 text-base"
                  value={query}
                  onChange={(event) => {
                    setPage(1);
                    setQuery(event.target.value);
                  }}
                  placeholder={`Rechercher dans ${title.toLocaleLowerCase()}`}
                />
              </div>
              <Badge className="min-h-9 px-3 text-sm" variant="outline">
                {result?.total ?? "…"} résultat(s)
              </Badge>
            </div>
            <div className="space-y-4 border-t pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">Filtres rapides</p>
                {Object.values(filters).some(Boolean) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPage(1);
                      setFilters({});
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
              {entityType === "books" && (
                <div className="w-64 shrink-0 space-y-2">
                  <Label className="text-sm font-medium" htmlFor="book-author-filter">
                    Auteur
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="book-author-filter"
                      className="h-8 pl-8 text-xs"
                      value={filters.author ?? ""}
                      onChange={(event) => {
                        setPage(1);
                        setFilters((current) => ({ ...current, author: event.target.value }));
                      }}
                      placeholder="Nom de l’auteur"
                    />
                  </div>
                </div>
              )}
              {filterDefinitions.map((filter) => (
                <fieldset key={filter.key} className="shrink-0 space-y-2">
                  <legend className="text-sm font-medium">{filter.label}</legend>
                  <ButtonGroup className="flex flex-nowrap gap-1 whitespace-nowrap" aria-label={`Filtrer par ${filter.label.toLocaleLowerCase()}`}>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      variant={!filters[filter.key] ? "secondary" : "outline"}
                      aria-pressed={!filters[filter.key]}
                      onClick={() => {
                        setPage(1);
                        setFilters((current) => ({ ...current, [filter.key]: "" }));
                      }}
                    >
                      Tous
                    </Button>
                    {filter.options.map((option) => (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        key={option.value}
                        variant={filters[filter.key] === option.value ? "secondary" : "outline"}
                        aria-pressed={filters[filter.key] === option.value}
                        onClick={() => {
                          setPage(1);
                          setFilters((current) => ({ ...current, [filter.key]: option.value }));
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </fieldset>
              ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-base text-destructive"
          >
            {error}
          </p>
        ) : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow className="h-14">
                    <TableHead className="text-sm">
                      {entityType === "books" ? "Titre" : "Nom"}
                    </TableHead>
                    <TableHead className="hidden text-sm md:table-cell">
                      Informations
                    </TableHead>
                    <TableHead className="hidden text-sm sm:table-cell">
                      État
                    </TableHead>
                    <TableHead className="text-right text-sm">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!result ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : result.items.length ? (
                    result.items.map((item) => (
                      <TableRow className="h-16" key={item.id}>
                        <TableCell className="text-base font-medium">
                          {item.imageSrc ? (
                            <span className="flex items-center gap-3">
                              <Image
                                src={item.imageSrc}
                                alt=""
                                width={32}
                                height={48}
                                className="h-12 w-8 rounded-md border object-cover"
                              />
                              <span>{item.label}</span>
                            </span>
                          ) : (
                            item.label
                          )}
                        </TableCell>
                        <TableCell className="hidden text-base text-muted-foreground md:table-cell">
                          {item.secondary || "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            className="min-h-8 px-3 text-sm"
                            variant={
                              item.status === "archived"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {item.status === "archived" ? "Archivé" : "Actif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            className="min-h-10 text-sm"
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/admin/${entityType}/${item.id}`}>
                              <Pencil />
                              Ouvrir
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-36 text-center text-base text-muted-foreground"
                      >
                        Aucune fiche trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        <Pager result={result} page={page} setPage={setPage} />
      </div>
    </Frame>
  );
}

function RelationManager({
  type,
  links,
  onChange,
}: {
  type: "persons" | "organizations";
  links: EntityLink[];
  onChange: (value: EntityLink[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<AdminRecord[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLabel, setCreateLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const roles = type === "persons" ? personRoles : organizationRoles;
  useEffect(() => {
    if (!query.trim()) return;
    let live = true;
    void api(`relations?entityType=${type}&q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then(
        (value: { items?: AdminRecord[] }) =>
          live && setOptions(value.items ?? []),
      );
    return () => {
      live = false;
    };
  }, [query, type]);
  function add(item: AdminRecord) {
    const id = type === "persons" ? "personId" : "organizationId";
    if (links.some((link) => link[id] === item.id)) return;
    onChange([
      ...links,
      { [id]: item.id, role: roles[0], label: item.label, archived: false },
    ]);
    setQuery("");
    setOptions([]);
  }
  async function createRelated() {
    if (!createLabel.trim()) return;
    setCreating(true);
    try {
      const payload =
        type === "persons"
          ? { "Prénom Nom": createLabel.trim() }
          : { Organisme: createLabel.trim(), Type: "organisme partenaire" };
      const response = await api(type, {
        method: "POST",
        body: JSON.stringify({ payload }),
      });
      const value: unknown = await response.json();
      if (!response.ok) throw new Error("Création impossible");
      add(value as AdminRecord);
      setCreateOpen(false);
      setCreateLabel("");
      toast.success("Fiche créée et associée au livre");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Création impossible",
      );
    } finally {
      setCreating(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "persons"
            ? "Auteurs"
            : "Organisations liées"}
        </CardTitle>
        <CardDescription>
          Les liens reposent sur les identifiants D1 et restent stables après
          renommage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-64 flex-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Rechercher une ${type === "persons" ? "personne" : "organisation"}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreateOpen(true)}
          >
            <FilePlus2 />
            Créer
          </Button>
        </div>
        {query.trim() &&
          options.map((item) => (
            <button
              type="button"
              className="block w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
              key={item.id}
              onClick={() => add(item)}
            >
              {item.label}
            </button>
          ))}
        {links.length ? (
          links.map((link, index) => (
            <div
              key={`${link.personId ?? link.organizationId}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-md border p-3"
            >
              <span className="min-w-40 flex-1 font-medium">{link.label}</span>
              {link.archived && <Badge variant="secondary">Archivé</Badge>}
              <Select
                value={link.role}
                onValueChange={(role) =>
                  onChange(
                    links.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, role } : current,
                    ),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Retirer ${link.label}`}
                onClick={() =>
                  onChange(
                    links.filter((_, currentIndex) => currentIndex !== index),
                  )
                }
              >
                <X />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune relation ajoutée.
          </p>
        )}
      </CardContent>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Créer une {type === "persons" ? "personne" : "organisation"}
            </DialogTitle>
            <DialogDescription>
              La fiche minimale sera immédiatement associée à ce livre. Vous
              pourrez la compléter ensuite.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="mb-2 block" htmlFor={`new-${type}`}>
              {type === "persons" ? "Nom complet" : "Nom de l’organisation"}
            </Label>
            <Input
              id={`new-${type}`}
              value={createLabel}
              onChange={(event) => setCreateLabel(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={creating || !createLabel.trim()}
              onClick={() => void createRelated()}
            >
              {creating && <Loader2 className="animate-spin" />}Créer et
              associer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function AdminEntityEditor({
  entityType,
  id,
}: {
  entityType: AdminEntityType;
  id: string;
}) {
  const router = useRouter();
  const isNew = id === "new";
  const [record, setRecord] = useState<AdminRecord | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown>>(() =>
    entityType === "books" ? { [COLLECTIVE_BOOK_FIELD]: false } : {},
  );
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [personLinks, setPersonLinks] = useState<EntityLink[]>([]);
  const [organizationLinks, setOrganizationLinks] = useState<EntityLink[]>([]);
  const [tableOfContentsEntries, setTableOfContentsEntries] = useState<BookTableOfContentsEntry[]>([]);
  const [pending, setPending] = useState(false);
  const [action, setAction] = useState<"archive" | "restore" | "purge" | null>(
    null,
  );
  const [purgeLabel, setPurgeLabel] = useState("");
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [schemaFields, setSchemaFields] = useState<string[]>([]);
  const primary =
    entityType === "books"
      ? "Titre"
      : entityType === "persons"
        ? "Prénom Nom"
        : "Organisme";
  const initialFields =
    entityType === "organizations"
          ? ([
          ["Organisme", ""],
          ["Type", ""],
        ] as [string, unknown][])
      : entityType === "persons"
        ? ([[primary, ""], ["Nom Auteur Hébreu", ""]] as [string, unknown][])
        : ([[primary, ""]] as [string, unknown][]);
  useEffect(() => {
    if (!isNew)
      void api(`${entityType}/${id}`)
        .then(async (response) => {
          const value: unknown = await response.json();
          if (!response.ok) throw new Error("Fiche introuvable");
          const item = value as AdminRecord;
          setRecord(item);
          setPayload(item.payload);
          setImageKey(item.imageKey);
          setPersonLinks(item.personLinks ?? []);
          setOrganizationLinks(item.organizationLinks ?? []);
          setTableOfContentsEntries(item.tableOfContentsEntries ?? []);
        })
        .catch((caught: unknown) =>
          toast.error(
            caught instanceof Error ? caught.message : "Chargement impossible",
          ),
        );
  }, [entityType, id, isNew]);
  useEffect(() => {
    if (!isNew) return;
    void api(`${entityType}/schema`)
      .then(async (response) => {
        const value: unknown = await response.json();
        if (
          !response.ok ||
          typeof value !== "object" ||
          value === null ||
          !("fields" in value) ||
          !Array.isArray(value.fields)
        )
          throw new Error("Chargement des champs impossible");
        setSchemaFields(
          value.fields.filter(
            (field): field is string => typeof field === "string",
          ),
        );
      })
      .catch((caught: unknown) =>
        toast.error(
          caught instanceof Error
            ? caught.message
            : "Chargement des champs impossible",
        ),
      );
  }, [entityType, isNew]);
  const fields = useMemo(() => {
    const payloadFields = Object.entries(payload).filter(
      ([key, value]) =>
        key !== "id" &&
        key !== "dataQuality" &&
        key !== "Image. URL" &&
        key !== COLLECTIVE_BOOK_FIELD &&
        shouldDisplayAdminPayloadField(entityType, key) &&
        (typeof value !== "object" || value === null),
    );
    if (!isNew) {
      const values = new Map<string, unknown>(payloadFields);
      if (entityType === "books")
        BOOK_ADDITIONAL_FIELDS.forEach((field) =>
          values.set(field, values.get(field) ?? ""),
        );
      return Array.from(values.entries()).sort((left, right) =>
        compareAdminFields(entityType, left, right),
      );
    }
    const values = new Map<string, unknown>(initialFields);
    schemaFields.forEach((field) => values.set(field, values.get(field) ?? ""));
    if (entityType === "books")
      BOOK_ADDITIONAL_FIELDS.forEach((field) => values.set(field, values.get(field) ?? ""));
    payloadFields.forEach(([field, value]) => values.set(field, value));
    return Array.from(values.entries())
      .filter(([field]) => shouldDisplayAdminPayloadField(entityType, field))
      .sort((left, right) => compareAdminFields(entityType, left, right));
  }, [entityType, initialFields, isNew, payload, schemaFields]);
  async function save(force = false) {
    setPending(true);
    try {
      const response = await api(isNew ? entityType : `${entityType}/${id}`, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify({
          payload,
          version: record?.version,
          imageKey,
          personLinks,
          organizationLinks,
          tableOfContentsEntries,
          confirmDuplicate: force || confirmDuplicate,
        }),
      });
      const value: unknown = await response.json();
      if (
        response.status === 409 &&
        typeof value === "object" &&
        value !== null &&
        "error" in value &&
        String(value.error).includes("Doublon")
      ) {
        setConfirmDuplicate(true);
        toast.warning(
          "Doublon potentiel détecté : enregistre à nouveau pour confirmer.",
        );
        return;
      }
      if (!response.ok)
        throw new Error(
          typeof value === "object" && value !== null && "error" in value
            ? String(value.error)
            : "Sauvegarde impossible",
        );
      const item = value as AdminRecord;
      setRecord(item);
      setPayload(item.payload);
      setImageKey(item.imageKey);
      setPersonLinks(item.personLinks ?? personLinks);
      setOrganizationLinks(item.organizationLinks ?? organizationLinks);
      setTableOfContentsEntries(item.tableOfContentsEntries ?? tableOfContentsEntries);
      toast.success(isNew ? "Fiche créée" : "Modifications enregistrées");
      if (isNew) router.replace(`/admin/${entityType}/${item.id}`);
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Sauvegarde impossible",
      );
    } finally {
      setPending(false);
    }
  }
  async function upload(file: File) {
    const data = new FormData();
    data.set("file", file);
    data.set("entityType", entityType);
    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: data,
    });
    const value: unknown = await response.json();
    if (
      !response.ok ||
      typeof value !== "object" ||
      value === null ||
      !("key" in value) ||
      typeof value.key !== "string"
    )
      throw new Error("Téléversement impossible");
    setImageKey(value.key);
    toast.success("Image téléversée. Enregistrez la fiche pour la publier.");
  }
  async function mutate() {
    if (
      !action ||
      isNew ||
      (action === "purge" && purgeLabel !== record?.label)
    )
      return;
    setPending(true);
    try {
      const response = await api(`${entityType}/${id}/${action}`, {
        method: "POST",
        body: "{}",
      });
      const value: unknown = await response.json();
      if (!response.ok)
        throw new Error(
          typeof value === "object" && value !== null && "error" in value
            ? String(value.error)
            : "Action impossible",
        );
      toast.success(
        action === "archive"
          ? "Fiche archivée"
          : action === "restore"
            ? "Fiche restaurée"
            : "Fiche supprimée définitivement",
      );
      if (action === "purge") router.replace(`/admin/${entityType}`);
      else window.location.reload();
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Action impossible",
      );
    } finally {
      setPending(false);
      setAction(null);
    }
  }
  const relatedBooks = record?.linkedBooks ?? [];
  const fieldGroups = creationSectionOrder[entityType]
    .map((section) => ({
      section,
      fields: fields.filter(([field]) => fieldSection(entityType, field) === section),
    }))
    .filter(
      (group) =>
        group.fields.length > 0 ||
        (entityType === "books" && group.section === "Ouvrage"),
    );
  return (
    <Frame
      title={
        isNew
          ? `Créer — ${labels[entityType]}`
          : (record?.label ?? "Chargement")
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5">
          <div>
            <h1 className="text-2xl font-semibold">
              {isNew
                ? `Nouvelle fiche ${labels[entityType].toLocaleLowerCase().slice(0, -1)}`
                : record?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              Les champs importés restent visibles et modifiables.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/${entityType}`}>Retour</Link>
            </Button>
            <Button disabled={pending} onClick={() => void save()}>
              {pending && <Loader2 className="animate-spin" />}Enregistrer
            </Button>
          </div>
        </div>
        {confirmDuplicate && (
          <Card className="border-amber-500">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm">
                Un doublon actif est possible. Vous pouvez confirmer
                volontairement cet enregistrement.
              </p>
              <Button variant="outline" onClick={() => void save(true)}>
                Confirmer le doublon
              </Button>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
            <CardDescription>
              Facultative, JPEG, PNG ou WebP, 10 Mo maximum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file)
                  void upload(file).catch((caught: unknown) =>
                    toast.error(
                      caught instanceof Error
                        ? caught.message
                        : "Téléversement impossible",
                    ),
                  );
              }}
            />
            {imageKey && (
              <div className="flex flex-wrap items-center gap-3">
                <img
                  className="h-24 w-20 rounded-md border object-cover"
                  src={imageKey}
                  alt="Aperçu du média"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImageKey(null)}
                >
                  Retirer de la fiche
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {isNew ? "Informations de la fiche" : "Informations"}
            </CardTitle>
            <CardDescription>
              {isNew
                ? "Complétez les informations par famille, dans l’ordre qui vous convient."
                : "Les champs vides sont conservés pour être complétés plus tard."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fieldGroups.length ? (
              fieldGroups.map((group) => (
                <section
                  key={group.section}
                  className="border-b border-border/70 pb-6 last:border-b-0 last:pb-0"
                >
                  <h2 className="text-base font-semibold">{group.section}</h2>
                  <div className="mt-4 grid gap-x-5 gap-y-4 md:grid-cols-2">
                    {entityType === "books" &&
                      group.section === "Ouvrage" && (
                        <div className="space-y-2 md:col-span-2">
                          <Label className="block text-sm" htmlFor="ouvrage-collectif">
                            Ouvrage collectif
                          </Label>
                          <Select
                            value={
                              isCollectiveBook(payload)
                                ? "yes"
                                : "no"
                            }
                            onValueChange={(value) =>
                              setPayload((current) => ({
                                ...current,
                                [COLLECTIVE_BOOK_FIELD]: value === "yes",
                              }))
                            }
                          >
                            <SelectTrigger
                              id="ouvrage-collectif"
                              className="min-h-11 max-w-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Oui</SelectItem>
                              <SelectItem value="no">Non</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Indique si le livre réunit des textes de plusieurs auteurs.
                          </p>
                          {isCollectiveBook(payload) && (
                            <p className="text-sm text-muted-foreground">
                              Renseignez les nouvelles, leurs auteurs et leurs traducteurs dans la{" "}
                              <a className="text-blue-600 underline underline-offset-2" href="#table-des-matieres">
                                section table des matières
                              </a>
                              .
                            </p>
                          )}
                        </div>
                      )}
                    {entityType === "books" &&
                      group.section === "Ouvrage" && (
                        <div className="md:col-span-2">
                          <Label
                            className="mb-2 block text-sm"
                            htmlFor="titre-original-en-transcription"
                          >
                            Titre original en transcription
                          </Label>
                          <InputGroup className="min-h-11">
                            <InputGroupInput
                              id="titre-original-en-transcription"
                              value={String(
                                payload[BOOK_TRANSCRIPTION_TITLE_FIELD] ||
                                  payload[BOOK_ORIGINAL_TITLE_FIELD] ||
                                  "",
                              )}
                              onChange={(event) =>
                                setPayload((current) => ({
                                  ...current,
                                  [BOOK_ORIGINAL_TITLE_FIELD]: event.target.value,
                                  [BOOK_TRANSCRIPTION_TITLE_FIELD]: event.target.value,
                                }))
                              }
                            />
                          </InputGroup>
                        </div>
                      )}
                    {group.fields.map(([field, value]) => (
                      <AdminPayloadField
                        key={field}
                        field={field}
                        value={value}
                        onChange={(nextValue) =>
                          setPayload((current) => ({
                            ...current,
                            [field]: nextValue,
                          }))
                        }
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <Skeleton className="h-64" />
            )}
          </CardContent>
        </Card>
        {entityType === "books" && isCollectiveBook(payload) && (
          <TableOfContentsEditor
            entries={tableOfContentsEntries}
            onChange={setTableOfContentsEntries}
          />
        )}
        {entityType === "books" && (
          <>
            <RelationManager
              type="persons"
              links={personLinks}
              onChange={setPersonLinks}
            />
            <RelationManager
              type="organizations"
              links={organizationLinks}
              onChange={setOrganizationLinks}
            />
          </>
        )}
        {entityType !== "books" && (
          <Card>
            <CardHeader>
              <CardTitle>Livres associés</CardTitle>
              <CardDescription>
                Les relations sont modifiées depuis la fiche du livre.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relatedBooks.length ? (
                relatedBooks.map((book) => (
                  <Link
                    className="flex items-center justify-between border-b py-2 last:border-0 hover:text-primary"
                    key={book.bookId}
                    href={`/admin/books/${book.bookId}`}
                  >
                    <span>{book.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {book.role}
                      {book.archived ? " · archivé" : ""}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun livre associé.
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {record && (
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
              <p>ID : {record.id}</p>
              <p>Version : {record.version}</p>
              <p>Créée le : {record.createdAt}</p>
              <p>Modifiée le : {record.updatedAt}</p>
              <p>État : {record.status}</p>
            </CardContent>
          </Card>
        )}
        {record && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setAction(record.status === "archived" ? "restore" : "archive")
              }
            >
              <Archive />
              {record.status === "archived" ? "Restaurer" : "Archiver"}
            </Button>
            {record.status === "archived" && (
              <Button variant="destructive" onClick={() => setAction("purge")}>
                <Trash2 />
                Supprimer définitivement
              </Button>
            )}
          </div>
        )}
      </div>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l’action</DialogTitle>
            <DialogDescription>
              {action === "purge"
                ? "Cette suppression est définitive. Saisissez le nom exact pour continuer."
                : "Cette action modifie immédiatement la visibilité publique de la fiche."}
            </DialogDescription>
          </DialogHeader>
          {action === "purge" && (
            <Input
              value={purgeLabel}
              onChange={(event) => setPurgeLabel(event.target.value)}
              placeholder={record?.label}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Annuler
            </Button>
            <Button
              variant={action === "purge" ? "destructive" : "default"}
              disabled={
                pending || (action === "purge" && purgeLabel !== record?.label)
              }
              onClick={() => void mutate()}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Frame>
  );
}

export function AdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminPageResult | null>(null);
  useEffect(() => {
    const parameters = new URLSearchParams({ page: String(page), q: query });
    if (action !== "all") parameters.set("action", action);
    if (entityType !== "all") parameters.set("entityType", entityType);
    if (from) parameters.set("from", from);
    if (to) parameters.set("to", to);
    void api(`logs?${parameters.toString()}`)
      .then(async (response) => {
        const value = (await response.json()) as {
          items?: AdminLogEntry[];
          page?: number;
          pageSize?: number;
          total?: number;
          totalPages?: number;
        };
        if (!response.ok) throw new Error("Chargement impossible");
        setLogs(value.items ?? []);
        setResult({
          items: [],
          page: value.page ?? page,
          pageSize: value.pageSize ?? 25,
          total: value.total ?? 0,
          totalPages: value.totalPages ?? 1,
        });
      })
      .catch((caught: unknown) =>
        toast.error(
          caught instanceof Error ? caught.message : "Chargement impossible",
        ),
      );
  }, [action, entityType, from, page, query, to]);
  return (
    <Frame title="Historique">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Historique des changements</CardTitle>
            <CardDescription>
              Les suppressions définitives restent traçables.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Rechercher une fiche"
            />
            <Select
              value={action}
              onValueChange={(value) => {
                setPage(1);
                setAction(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {["create", "update", "archive", "restore", "purge"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Select
              value={entityType}
              onValueChange={(value) => {
                setPage(1);
                setEntityType(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les entités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                {Object.entries(labels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={from}
              onChange={(event) => {
                setPage(1);
                setFrom(event.target.value);
              }}
              aria-label="Date de début"
            />
            <Input
              type="date"
              value={to}
              onChange={(event) => {
                setPage(1);
                setTo(event.target.value);
              }}
              aria-label="Date de fin"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Fiche</TableHead>
                  <TableHead>Résumé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(log.occurredAt))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.entityLabel}</TableCell>
                      <TableCell>{log.summary}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-28 text-center text-muted-foreground"
                    >
                      Aucun changement enregistré.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Pager result={result} page={page} setPage={setPage} />
      </div>
    </Frame>
  );
}

export function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [results, setResults] = useState<
    Partial<Record<AdminEntityType, AdminPageResult>>
  >({});
  async function search() {
    const response = await api(
      `search?q=${encodeURIComponent(query)}&includeArchived=${includeArchived}`,
    );
    setResults(
      (await response.json()) as Partial<
        Record<AdminEntityType, AdminPageResult>
      >,
    );
  }
  return (
    <Frame title="Recherche globale">
      <div className="space-y-5">
        <div className="px-5">
          <h1 className="text-2xl font-semibold">Recherche globale</h1>
          <p className="text-sm text-muted-foreground">
            Livres, personnes et organisations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-64 flex-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void search();
            }}
            placeholder="Titre, nom, organisme…"
          />
          <Button onClick={() => void search()}>
            <Search />
            Rechercher
          </Button>
          <Button
            variant={includeArchived ? "secondary" : "outline"}
            onClick={() => setIncludeArchived((value) => !value)}
          >
            Inclure la corbeille
          </Button>
        </div>
        {(["books", "persons", "organizations"] as AdminEntityType[]).map(
          (type) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle>{labels[type]}</CardTitle>
              </CardHeader>
              <CardContent>
                {results[type]?.items.length ? (
                  results[type]?.items.map((item) => (
                    <Link
                      className="flex min-h-16 items-center justify-between gap-4 border-b py-3 last:border-0 hover:text-primary"
                      key={item.id}
                      href={`/admin/${type}/${item.id}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {item.imageSrc ? (
                          <Image
                            src={item.imageSrc}
                            alt=""
                            width={type === "books" ? 32 : 40}
                            height={type === "books" ? 48 : 40}
                            className={type === "books" ? "h-12 w-8 shrink-0 rounded-md border object-cover" : "size-10 shrink-0 rounded-md border object-cover"}
                          />
                        ) : null}
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="shrink-0 text-right text-sm text-muted-foreground">
                        {item.secondary}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Lancez une recherche pour afficher les résultats.
                  </p>
                )}
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </Frame>
  );
}

export function AdminTrashPage() {
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState<AdminEntityType | "all">("all");
  useEffect(() => {
    void api("trash")
      .then((response) => response.json())
      .then((value: Partial<Record<AdminEntityType, AdminPageResult>>) =>
        setRecords(
          (["books", "persons", "organizations"] as AdminEntityType[]).flatMap(
            (type) => value[type]?.items ?? [],
          ),
        ),
      );
  }, []);
  const visibleRecords = records.filter(
    (item) =>
      (entityType === "all" || item.entityType === entityType) &&
      item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <Frame title="Corbeille">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Corbeille</CardTitle>
            <CardDescription>
              Les fiches archivées sont récupérables ou supprimables
              définitivement.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une fiche archivée"
            />
            <Select
              value={entityType}
              onValueChange={(value) =>
                setEntityType(value as AdminEntityType | "all")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(labels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fiche</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Archivage</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRecords.length ? (
                  visibleRecords.map((item) => (
                    <TableRow key={`${item.entityType}-${item.id}`}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{labels[item.entityType]}</TableCell>
                      <TableCell>
                        {item.archivedAt
                          ? new Intl.DateTimeFormat("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(item.archivedAt))
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/${item.entityType}/${item.id}`}>
                            Ouvrir
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Aucune fiche archivée ne correspond aux filtres.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Frame>
  );
}
