"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  BookOpen,
  Building2,
  Check,
  ChevronsUpDown,
  Eye,
  Home,
  History,
  KeyRound,
  Loader2,
  LockKeyhole,
  MoreHorizontal,
  Save,
  Search,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { getPersonImageEntries, type PersonImageEntry } from "@/lib/person-images";

const MAX_SHOWCASE_COUNT = 12;

type ApiAuthorsResponse = {
  selectedNames?: unknown;
  entries?: unknown;
};

function readSelectedNames(payload: unknown): string[] {
  if (Array.isArray(payload) && payload.every((item) => typeof item === "string")) {
    return payload.slice(0, MAX_SHOWCASE_COUNT);
  }

  if (typeof payload === "object" && payload !== null && "selectedNames" in payload) {
    const selectedNames = (payload as ApiAuthorsResponse).selectedNames;
    if (Array.isArray(selectedNames)) {
      return selectedNames
        .filter((name): name is string => typeof name === "string")
        .slice(0, MAX_SHOWCASE_COUNT);
    }
  }

  if (typeof payload === "object" && payload !== null && "entries" in payload) {
    const entries = (payload as ApiAuthorsResponse).entries;
    if (Array.isArray(entries)) {
      return entries
        .flatMap((entry) => {
          if (typeof entry === "object" && entry !== null && "name" in entry) {
            const name = (entry as { name?: unknown }).name;
            return typeof name === "string" ? [name] : [];
          }

          return [];
        })
        .slice(0, MAX_SHOWCASE_COUNT);
    }
  }

  return [];
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return fallback;
}

function sameNames(first: Set<string>, second: Set<string>): boolean {
  return first.size === second.size && Array.from(first).every((name) => second.has(name));
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Mot de passe incorrect."));
      }

      onAuthenticated();
      toast.success("Accès administrateur autorisé");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6 sm:p-10">
      <Card className="w-full max-w-md border-border/80 shadow-sm">
        <CardHeader className="gap-3 px-7 pt-8 sm:px-9">
          <p className="text-sm font-semibold tracking-wide text-primary">STAVNET · ESPACE SÉCURISÉ</p>
          <CardTitle className="text-3xl tracking-tight">Administration</CardTitle>
          <CardDescription className="text-base leading-relaxed">Connectez-vous pour gérer les contenus administrables.</CardDescription>
        </CardHeader>
        <CardContent className="px-7 pb-8 sm:px-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base" htmlFor="admin-password">Mot de passe</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-12 text-lg"
              />
              {error ? (
                <p className="text-base text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              {isSubmitting ? "Vérification" : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function SelectionDialog({
  entries,
  selectedNames,
  onToggle,
}: {
  entries: PersonImageEntry[];
  selectedNames: Set<string>;
  onToggle: (name: string, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");

    if (!normalizedQuery) {
      return entries;
    }

    return entries.filter((entry) => entry.name.toLocaleLowerCase("fr").includes(normalizedQuery));
  }, [entries, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="size-4" />
          Modifier la sélection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Choisir les auteurs</DialogTitle>
          <DialogDescription>
            Sélectionnez jusqu’à {MAX_SHOWCASE_COUNT} portraits. Les auteurs disponibles sont ceux du dossier public/images/persons/.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un auteur"
              aria-label="Rechercher un auteur"
              className="pl-8"
            />
          </div>
          <Badge variant="outline">
            {selectedNames.size} / {MAX_SHOWCASE_COUNT}
          </Badge>
        </div>
        <div className="max-h-[60vh] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead className="text-right">État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => {
                  const selected = selectedNames.has(entry.name);
                  const disabled = !selected && selectedNames.size >= MAX_SHOWCASE_COUNT;

                  return (
                    <TableRow key={entry.name} data-state={selected ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected}
                          disabled={disabled}
                          onCheckedChange={(checked) => onToggle(entry.name, checked === true)}
                          aria-label={`Afficher ${entry.name} sur l’étoile`}
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={entry.src}
                          alt={`Portrait de ${entry.name}`}
                          width={40}
                          height={40}
                          sizes="40px"
                          className="size-10 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="text-right">
                        {selected ? (
                          <Badge variant="secondary">
                            <Check className="size-3" />
                            Sélectionné
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disponible</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucun auteur trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SelectedAuthorsTable({
  entries,
  isLoading,
  loadError,
  onRemove,
}: {
  entries: Array<PersonImageEntry & { position: number }>;
  isLoading: boolean;
  loadError: string;
  onRemove: (name: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 text-sm text-destructive" role="alert">
        {loadError}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Image</TableHead>
          <TableHead>Auteur</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <TableRow key={entry.name}>
              <TableCell>
                <Image
                  src={entry.src}
                  alt={`Portrait de ${entry.name}`}
                  width={44}
                  height={44}
                  sizes="44px"
                  className="size-11 rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{entry.name}</TableCell>
              <TableCell>
                <Badge variant="outline">#{entry.position}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">public/images/persons/</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onRemove(entry.name)} aria-label={`Retirer ${entry.name}`}>
                  <X className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              Aucun auteur sélectionné.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const entries = useMemo(() => getPersonImageEntries(), []);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadSelection() {
      try {
        const response = await fetch("/api/admin/showcase", { cache: "no-store" });
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(getErrorMessage(payload, "Impossible de charger la sélection."));
        }

        const names = new Set(readSelectedNames(payload));

        if (isCurrent) {
          setSelectedNames(names);
          setSavedNames(new Set(names));
        }
      } catch (caughtError) {
        if (isCurrent) {
          setLoadError(caughtError instanceof Error ? caughtError.message : "Impossible de charger la sélection.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadSelection();

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedEntries = useMemo(
    () =>
      Array.from(selectedNames).flatMap((name, index) => {
        const entry = entries.find((candidate) => candidate.name === name);
        return entry ? [{ ...entry, position: index + 1 }] : [];
      }),
    [entries, selectedNames],
  );
  const hasChanges = !sameNames(selectedNames, savedNames);
  const remainingSlots = MAX_SHOWCASE_COUNT - selectedNames.size;

  function toggleAuthor(name: string, checked: boolean) {
    setSelectedNames((current) => {
      const next = new Set(current);

      if (checked && next.size < MAX_SHOWCASE_COUNT) {
        next.add(name);
      }

      if (!checked) {
        next.delete(name);
      }

      return next;
    });
  }

  async function saveSelection() {
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: Array.from(selectedNames).slice(0, MAX_SHOWCASE_COUNT) }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "La sauvegarde a échoué."));
      }

      const names = new Set(readSelectedNames(payload));
      setSelectedNames(names);
      setSavedNames(new Set(names));
      toast.success("Sélection enregistrée");
    } catch (caughtError) {
      toast.error(caughtError instanceof Error ? caughtError.message : "La sauvegarde a échoué.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Vitrine des auteurs">
                      <Sparkles className="size-4" />
                      <span>Vitrine des auteurs</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Livres">
                      <Link href="/admin/books"><BookOpen className="size-4" /><span>Livres</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Personnes">
                      <Link href="/admin/persons"><Users className="size-4" /><span>Personnes</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Organisations">
                      <Link href="/admin/organizations"><Building2 className="size-4" /><span>Organisations</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Recherche globale">
                      <Link href="/admin/search"><Search className="size-4" /><span>Recherche globale</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Corbeille">
                      <Link href="/admin/trash"><Archive className="size-4" /><span>Corbeille</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Historique">
                      <Link href="/admin/logs"><History className="size-4" /><span>Historique</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Page d’accueil">
                  <Link href="/en">
                    <Home className="size-4" />
                    <span>Page d’accueil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} tooltip="Se déconnecter">
                  <LockKeyhole className="size-4" />
                  <span>Se déconnecter</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0 overflow-x-hidden bg-zinc-50">
          <header className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-5 lg:px-8">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <ChevronsUpDown className="size-4 text-zinc-400" />
                <p className="truncate text-base font-semibold">Vitrine des auteurs</p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/en">
                  <Eye className="size-4" />
                  Voir le site
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex min-w-0 flex-1 flex-col gap-8 p-5 lg:p-8 xl:p-10">
            <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Card className="min-w-0">
                <CardHeader>
                  <CardDescription>Portraits sélectionnés</CardDescription>
                  <CardTitle className="text-3xl">{selectedNames.size}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground">Maximum {MAX_SHOWCASE_COUNT} auteurs.</p>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardHeader>
                  <CardDescription>Auteurs disponibles</CardDescription>
                  <CardTitle className="text-3xl">{entries.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground">Images trouvées dans le dossier public.</p>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardHeader>
                  <CardDescription>Places restantes</CardDescription>
                  <CardTitle className="text-3xl">{remainingSlots}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground">Capacité de l’étoile 3D.</p>
                </CardContent>
              </Card>
              <Card className="min-w-0">
                <CardHeader>
                  <CardDescription>État</CardDescription>
                  <CardTitle className="text-3xl">{hasChanges ? "Modifié" : "À jour"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground">{hasChanges ? "Sauvegarde requise." : "Sélection synchronisée."}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="min-w-0">
              <CardHeader className="flex flex-col gap-4 border-b md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Auteurs affichés sur l’étoile</CardTitle>
                  <CardDescription>Une sélection unique est utilisée par la page d’accueil pour la vitrine 3D.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SelectionDialog entries={entries} selectedNames={selectedNames} onToggle={toggleAuthor} />
                  <Button onClick={() => void saveSelection()} disabled={!hasChanges || isSaving || isLoading}>
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {isSaving ? "Enregistrement" : "Enregistrer"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <SelectedAuthorsTable
                  entries={selectedEntries}
                  isLoading={isLoading}
                  loadError={loadError}
                  onRemove={(name) => toggleAuthor(name, false)}
                />
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Règles de publication</CardTitle>
                  <CardDescription>Contraintes appliquées à la vitrine.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" aria-label="Options">
                  <MoreHorizontal className="size-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Badge variant="outline">12 portraits maximum</Badge>
                  <Badge variant="outline">Images uniquement</Badge>
                  <Badge variant="outline">Sauvegarde persistante</Badge>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/admin/auth", { cache: "no-store" })
      .then(async (response) => {
        const payload: unknown = await response.json().catch(() => null);
        return response.ok && typeof payload === "object" && payload !== null && "authenticated" in payload && payload.authenticated === true;
      })
      .then((authenticated) => {
        if (isCurrent) {
          setIsAuthenticated(authenticated);
          setIsCheckingSession(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => undefined);
    setIsAuthenticated(false);
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <Skeleton className="h-10 w-48" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AdminShell onLogout={() => void handleLogout()} />;
}
