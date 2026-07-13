"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Eye,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Minus,
  RefreshCw,
  Save,
  Search,
  Users,
  X,
} from "lucide-react";

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
import { TooltipProvider } from "@/components/ui/tooltip";
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
      return selectedNames.filter((name): name is string => typeof name === "string").slice(0, MAX_SHOWCASE_COUNT);
    }
  }

  if (typeof payload === "object" && payload !== null && "entries" in payload) {
    const entries = (payload as ApiAuthorsResponse).entries;
    if (Array.isArray(entries)) {
      return entries.flatMap((entry) => {
        if (typeof entry === "object" && entry !== null && "name" in entry) {
          const name = (entry as { name?: unknown }).name;
          return typeof name === "string" ? [name] : [];
        }
        return [];
      }).slice(0, MAX_SHOWCASE_COUNT);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center bg-primary text-primary-foreground">
              <span className="font-serif text-lg">מ</span>
            </div>
            <div>
              <p className="text-sm font-semibold">STAVNET</p>
              <p className="text-sm text-muted-foreground">Administration</p>
            </div>
          </div>
          <CardTitle className="pt-6 text-2xl">Connexion administrateur</CardTitle>
          <CardDescription>Gérez les auteurs présentés sur la vitrine 3D de la page d’accueil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Mot de passe</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Saisir le mot de passe"
                required
              />
              {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <RefreshCw className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              {isSubmitting ? "Vérification…" : "Se connecter"}
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
    return normalizedQuery ? entries.filter((entry) => entry.name.toLocaleLowerCase("fr").includes(normalizedQuery)) : entries;
  }, [entries, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedNames.size >= MAX_SHOWCASE_COUNT}>
          <ImagePlus className="size-4" />
          Ajouter des auteurs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choisir les auteurs de la vitrine</DialogTitle>
          <DialogDescription>
            Sélectionnez au maximum {MAX_SHOWCASE_COUNT} auteurs. Seuls les portraits présents dans public/images/persons/ sont proposés.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un auteur" aria-label="Rechercher un auteur" className="pl-9" />
        </div>
        <div className="max-h-[55vh] overflow-y-auto rounded-md border">
          {filteredEntries.length > 0 ? filteredEntries.map((entry) => {
            const selected = selectedNames.has(entry.name);
            const disabled = !selected && selectedNames.size >= MAX_SHOWCASE_COUNT;
            return (
              <label key={entry.name} className="flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                <Checkbox checked={selected} disabled={disabled} onCheckedChange={(checked) => onToggle(entry.name, checked === true)} aria-label={`Afficher ${entry.name} sur l’étoile`} />
                <Image src={entry.src} alt={`Portrait de ${entry.name}`} width={48} height={48} sizes="48px" className="size-12 rounded-md object-cover" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{entry.name}</span>
                {selected ? <Check className="size-4" /> : null}
              </label>
            );
          }) : <p className="p-8 text-center text-sm text-muted-foreground">Aucun auteur trouvé.</p>}
        </div>
        <DialogFooter>
          <p className="mr-auto text-sm text-muted-foreground">{selectedNames.size} / {MAX_SHOWCASE_COUNT} sélectionnés</p>
          <DialogClose asChild><Button variant="outline">Fermer</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SelectedAuthorRow({ entry, onRemove }: { entry: PersonImageEntry & { position: number }; onRemove: (name: string) => void }) {
  return (
    <div className="flex items-center gap-3 border-b p-3 last:border-b-0">
      <Image src={entry.src} alt={`Portrait de ${entry.name}`} width={56} height={72} sizes="56px" className="size-14 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entry.name}</p>
        <p className="text-sm text-muted-foreground">Portrait #{entry.position}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(entry.name)} aria-label={`Retirer ${entry.name}`}>
        <X className="size-4" />
      </Button>
    </div>
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
        if (!response.ok) throw new Error(getErrorMessage(payload, "Impossible de charger la sélection."));
        const names = new Set(readSelectedNames(payload));
        if (isCurrent) {
          setSelectedNames(names);
          setSavedNames(new Set(names));
        }
      } catch (caughtError) {
        if (isCurrent) setLoadError(caughtError instanceof Error ? caughtError.message : "Impossible de charger la sélection.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    void loadSelection();
    return () => { isCurrent = false; };
  }, []);

  const selectedEntries = useMemo(() => Array.from(selectedNames).flatMap((name, index) => {
    const entry = entries.find((candidate) => candidate.name === name);
    return entry ? [{ ...entry, position: index + 1 }] : [];
  }), [entries, selectedNames]);
  const hasChanges = !sameNames(selectedNames, savedNames);

  function toggleAuthor(name: string, checked: boolean) {
    setSelectedNames((current) => {
      const next = new Set(current);
      if (checked && next.size < MAX_SHOWCASE_COUNT) next.add(name);
      if (!checked) next.delete(name);
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
      if (!response.ok) throw new Error(getErrorMessage(payload, "La sauvegarde a échoué."));
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
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b p-4 group-data-[collapsible=icon]:p-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="grid size-9 shrink-0 place-items-center bg-primary text-primary-foreground"><span className="font-serif text-lg">מ</span></div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold">STAVNET</p><p className="truncate text-sm text-muted-foreground">Administration</p></div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Configuration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem><SidebarMenuButton isActive tooltip="Vitrine des auteurs"><LayoutDashboard /><span>Vitrine des auteurs</span></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-2">
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton asChild tooltip="Page d’accueil"><Link href="/en"><Eye /><span>Page d’accueil</span></Link></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton onClick={onLogout} tooltip="Se déconnecter"><LockKeyhole /><span>Se déconnecter</span></SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-3"><SidebarTrigger /><Separator orientation="vertical" className="hidden h-5 sm:block" /><div><p className="text-sm text-muted-foreground">Administration</p><h1 className="font-semibold">Vitrine des auteurs</h1></div></div>
            <Button onClick={() => void saveSelection()} disabled={!hasChanges || isSaving || isLoading}><Save className="size-4" />{isSaving ? "Enregistrement…" : "Enregistrer"}</Button>
          </header>

          <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Auteurs affichés sur l’étoile</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">Choisissez les portraits qui apparaissent sur les faces extérieures de l’étoile 3D. L’étoile accepte exactement 12 portraits au maximum.</p>
            </div>

            <Card>
              <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                <div><CardTitle className="text-base">Sélection actuelle</CardTitle><CardDescription>{selectedNames.size} / {MAX_SHOWCASE_COUNT} portraits sélectionnés</CardDescription></div>
                <SelectionDialog entries={entries} selectedNames={selectedNames} onToggle={toggleAuthor} />
              </CardHeader>
              <CardContent className="p-0">
                {loadError ? <p className="border-b p-4 text-sm text-destructive" role="alert">{loadError}</p> : null}
                {isLoading ? <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div> : selectedEntries.length > 0 ? <div>{selectedEntries.map((entry) => <SelectedAuthorRow key={entry.name} entry={entry} onRemove={(name) => toggleAuthor(name, false)} />)}</div> : <div className="p-10 text-center"><Users className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Aucun auteur sélectionné</p><p className="mt-1 text-sm text-muted-foreground">Ouvrez le dialog pour composer la vitrine.</p></div>}
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 text-sm text-muted-foreground"><Minus className="mt-0.5 size-4 shrink-0" /><p>Les images sont chargées exclusivement depuis public/images/persons/. Les changements sont appliqués au prochain chargement de la vitrine 3D.</p></div>
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
      .catch(() => { if (isCurrent) setIsCheckingSession(false); });
    return () => { isCurrent = false; };
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => undefined);
    setIsAuthenticated(false);
  }

  if (isCheckingSession) return <main className="flex min-h-svh items-center justify-center bg-background"><Skeleton className="h-10 w-48" /></main>;
  if (!isAuthenticated) return <LoginScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  return <AdminShell onLogout={() => void handleLogout()} />;
}
