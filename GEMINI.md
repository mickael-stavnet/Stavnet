# GEMINI.md — Règles & Conventions du projet

> Ce fichier définit les règles absolues de développement pour ce projet.  
> Stack : **Next.js 16 (App Router)** · **TypeScript strict** · **Tailwind CSS v4** · **shadcn/ui**  
> Toute règle listée ici est **non négociable**. En cas de doute, consulter ce fichier en priorité.

---

## Table des matières

1. [TypeScript — Typage strict](#1-typescript--typage-strict)
2. [Next.js — Architecture App Router](#2-nextjs--architecture-app-router)
3. [Next.js — Data Fetching](#3-nextjs--data-fetching)
4. [Next.js — Server vs Client Components](#4-nextjs--server-vs-client-components)
5. [Tailwind CSS](#5-tailwind-css)
6. [shadcn/ui — Utilisation exclusive](#6-shadcnui--utilisation-exclusive)
7. [Skeletons & États de chargement](#7-skeletons--états-de-chargement)
8. [Gestion des erreurs](#8-gestion-des-erreurs)
9. [Structure des fichiers](#9-structure-des-fichiers)
10. [Conventions de nommage](#10-conventions-de-nommage)
11. [Performance](#11-performance)
12. [Accessibilité](#12-accessibilité)
13. [Interdictions absolues](#13-interdictions-absolues)

---

## 1. TypeScript — Typage strict

### 1.1 Configuration `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 1.2 Interdiction absolue de `any`

`any` est **totalement interdit** dans tout le codebase. Sans exception.

```typescript
// ❌ INTERDIT
const data: any = await fetch(...)
function process(input: any) {}
const result = value as any

// ✅ CORRECT — typer explicitement
const data: User = await fetchUser(id)
function process(input: unknown) {
  if (typeof input === 'string') { ... }
}
```

Alternatives à `any` :

- `unknown` pour les valeurs de type indéterminé (puis narrowing)
- `never` pour les branches impossibles
- Generics `<T>` pour les fonctions polymorphes
- `Record<string, unknown>` pour les objets dynamiques
- Zod ou une lib de validation pour les données externes (API, form)

### 1.3 Définition des types et interfaces

```typescript
// Préférer interface pour les objets extensibles
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Type pour les unions, intersections, types utilitaires
type Status = "idle" | "loading" | "success" | "error";
type UserWithRole = User & { role: "admin" | "user" };
type PartialUser = Partial<Pick<User, "email" | "name">>;

// Enum — utiliser const enum ou union de string literals
type Direction = "north" | "south" | "east" | "west";
// ou
const DIRECTIONS = ["north", "south", "east", "west"] as const;
type Direction = (typeof DIRECTIONS)[number];
```

### 1.4 Typage des props de composants

```typescript
// ✅ Toujours typer les props explicitement
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  className,
}: ButtonProps) {
  // ...
}

// ✅ Pour les composants enfants
interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

// ✅ Étendre les props HTML natives
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
```

### 1.5 Generics

```typescript
// ✅ Fonctions génériques typées
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

// ✅ Composants génériques
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  )
}
```

### 1.6 Narrowing et type guards

```typescript
// ✅ Type guard personnalisé
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

// ✅ Utilisation
const data: unknown = await fetchData("/api/user/1");
if (isUser(data)) {
  console.log(data.email); // TypeScript sait que c'est un User
}
```

### 1.7 Types utilitaires courants

```typescript
// Utiliser les utility types natifs TypeScript
type ReadonlyUser = Readonly<User>;
type OptionalUser = Partial<User>;
type RequiredUser = Required<User>;
type UserPreview = Pick<User, "id" | "name">;
type UserWithoutId = Omit<User, "id">;
type UserOrNull = User | null;
type MaybeUser = User | undefined | null;

// ReturnType et Parameters pour inférer depuis les fonctions
type FetchUserReturn = Awaited<ReturnType<typeof fetchUser>>;
type FetchUserParams = Parameters<typeof fetchUser>[0];
```

### 1.8 Validation des données externes avec Zod

```typescript
import { z } from "zod";

// ✅ Schéma Zod pour les données API
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.coerce.date(),
});

// Inférer le type TypeScript depuis le schéma
type User = z.infer<typeof UserSchema>;

// Valider les données inconnues
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const raw: unknown = await res.json();
  return UserSchema.parse(raw); // throws si invalide
}
```

---

## 2. Next.js — Architecture App Router

### 2.1 Structure des routes

```
app/
├── (auth)/                  # Route group — pas de segment URL
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx           # Layout partagé
│   ├── page.tsx             # /
│   └── settings/
│       └── page.tsx         # /settings
├── api/
│   └── users/
│       ├── route.ts         # GET /api/users, POST /api/users
│       └── [id]/
│           └── route.ts     # GET /api/users/:id
├── layout.tsx               # Root layout
├── loading.tsx              # Loading UI global
├── error.tsx                # Error boundary global
└── not-found.tsx            # 404
```

### 2.2 Fichiers spéciaux App Router

| Fichier         | Rôle                                        |
| --------------- | ------------------------------------------- |
| `page.tsx`      | Route publique, rendu de la page            |
| `layout.tsx`    | Layout persistant entre navigations         |
| `loading.tsx`   | UI de chargement (Suspense automatique)     |
| `error.tsx`     | Error boundary (`'use client'` obligatoire) |
| `not-found.tsx` | Page 404                                    |
| `template.tsx`  | Layout re-rendu à chaque navigation         |
| `route.ts`      | API Route Handler                           |
| `middleware.ts` | Middleware Edge (racine du projet)          |

### 2.3 Metadata

```typescript
// app/page.tsx
import type { Metadata } from "next";

// Metadata statique
export const metadata: Metadata = {
  title: "Mon Application",
  description: "Description de la page",
  openGraph: {
    title: "Mon Application",
    images: ["/og-image.png"],
  },
};

// Metadata dynamique
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product.name,
    description: product.description,
  };
}
```

### 2.4 Route Handlers (API)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";

  const users = await getUsers({ page: parseInt(page, 10) });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: unknown = await request.json();
  const parsed = CreateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await createUser(parsed.data);
  return NextResponse.json(user, { status: 201 });
}
```

---

## 3. Next.js — Data Fetching

### 3.1 Principes fondamentaux

- **Fetcher au plus haut niveau** possible (Server Component parent)
- **Passer les données en props** aux composants enfants
- **Ne jamais fetcher dans un Client Component** sauf cas justifié (mutations, real-time)
- **Utiliser `fetch` natif** avec les extensions Next.js pour le cache

### 3.2 Fetch dans les Server Components

```typescript
// ✅ Fetch direct dans un Server Component
// app/users/page.tsx
import { UserList } from '@/components/user-list'

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { page } = await searchParams
  const users = await getUsers({ page: Number(page ?? 1) })

  return <UserList users={users} />
}

// lib/data/users.ts — fonction de fetch typée
import { UserSchema } from '@/lib/schemas/user'
import { z } from 'zod'

const UsersResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
})

type UsersResponse = z.infer<typeof UsersResponseSchema>

export async function getUsers({ page }: { page: number }): Promise<UsersResponse> {
  const res = await fetch(
    `${process.env.API_URL}/users?page=${page}`,
    {
      next: { revalidate: 60 }, // ISR : revalide toutes les 60s
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`)
  }

  const raw: unknown = await res.json()
  return UsersResponseSchema.parse(raw)
}
```

### 3.3 Options de cache `fetch`

```typescript
// Données statiques — mise en cache indéfinie (SSG)
fetch(url, { cache: "force-cache" });

// Données dynamiques — jamais en cache (SSR)
fetch(url, { cache: "no-store" });

// ISR — revalidation par durée
fetch(url, { next: { revalidate: 3600 } }); // 1h

// ISR — revalidation par tag
fetch(url, { next: { tags: ["users"] } });

// Revalidation manuelle depuis une Server Action
import { revalidateTag, revalidatePath } from "next/cache";
revalidateTag("users");
revalidatePath("/users");
```

### 3.4 Parallel Data Fetching

```typescript
// ✅ Fetch en parallèle — éviter les waterfalls
export default async function DashboardPage() {
  // Lance tous les fetch simultanément
  const [users, stats, notifications] = await Promise.all([
    getUsers(),
    getStats(),
    getNotifications(),
  ])

  return (
    <Dashboard users={users} stats={stats} notifications={notifications} />
  )
}
```

### 3.5 Suspense et Streaming

```typescript
// ✅ Streaming partiel avec Suspense
import { Suspense } from 'react'
import { UserListSkeleton } from '@/components/skeletons'

export default function Page() {
  return (
    <main>
      <h1>Utilisateurs</h1>
      {/* Streamé indépendamment */}
      <Suspense fallback={<UserListSkeleton />}>
        <UserList />
      </Suspense>
    </main>
  )
}

// UserList est un Server Component async
async function UserList() {
  const users = await getUsers() // peut prendre du temps
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### 3.6 Server Actions

```typescript
// app/actions/users.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CreateUserSchema } from '@/lib/schemas/user'

export async function createUserAction(formData: FormData): Promise<void> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
  }

  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error('Données invalides')
  }

  await createUser(parsed.data)
  revalidatePath('/users')
  redirect('/users')
}

// Utilisation dans un formulaire
// app/users/new/page.tsx
export default function NewUserPage() {
  return (
    <form action={createUserAction}>
      <input name="name" type="text" required />
      <input name="email" type="email" required />
      <button type="submit">Créer</button>
    </form>
  )
}
```

### 3.7 `useActionState` pour les Server Actions avec feedback

```typescript
'use client'

import { useActionState } from 'react'
import { createUserAction } from '@/app/actions/users'

interface ActionState {
  error?: string
  success?: boolean
}

export function CreateUserForm() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    createUserAction,
    {}
  )

  return (
    <form action={action}>
      {state.error && <p className="text-destructive">{state.error}</p>}
      <input name="name" type="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Création...' : 'Créer'}
      </button>
    </form>
  )
}
```

---

## 4. Next.js — Server vs Client Components

### 4.1 Règle fondamentale

> **Server Component par défaut. `'use client'` uniquement si nécessaire.**

### 4.2 Quand utiliser `'use client'`

| Besoin                                              | Directive                    |
| --------------------------------------------------- | ---------------------------- |
| `useState`, `useReducer`, `useRef`                  | `'use client'`               |
| `useEffect`, `useLayoutEffect`                      | `'use client'`               |
| Event handlers (`onClick`, `onChange`…)             | `'use client'`               |
| Hooks de librairies tierces (zustand, react-query…) | `'use client'`               |
| Web APIs (`window`, `localStorage`, `navigator`)    | `'use client'`               |
| Composants shadcn interactifs                       | `'use client'` si nécessaire |

### 4.3 Patterns corrects

```typescript
// ✅ Server Component — fetch + passage de props
// app/dashboard/page.tsx (Server Component)
import { UserCard } from '@/components/user-card'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  return <UserCard user={user} /> // UserCard peut être Server ou Client
}

// ✅ Client Component — uniquement pour l'interactivité
// components/user-card.tsx
'use client'

import { useState } from 'react'
import type { User } from '@/lib/schemas/user'

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div onClick={() => setExpanded(!expanded)}>
      {user.name}
      {expanded && <p>{user.email}</p>}
    </div>
  )
}

// ✅ Composition — Server wrapper autour de Client interactif
// components/search-wrapper.tsx (Server Component)
import { SearchInput } from './search-input' // 'use client'

export async function SearchWrapper() {
  const initialData = await getSearchSuggestions()
  return <SearchInput suggestions={initialData} />
}
```

### 4.4 Règles de composition

- Un Server Component **peut** importer et rendre un Client Component
- Un Client Component **ne peut pas** importer un Server Component
- Passer un Server Component comme `children` à un Client Component est **autorisé**

```typescript
// ✅ Server Component passé en children à un Client Component
// app/layout.tsx (Server)
import { ThemeProvider } from '@/components/theme-provider' // 'use client'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

---

## 5. Tailwind CSS

### 5.1 Principes

- **Tailwind uniquement** pour le styling — pas de CSS-in-JS, pas de modules CSS sauf cas exceptionnel documenté
- **Pas de styles inline** `style={{...}}` — utiliser des classes Tailwind ou des CSS variables
- **`cn()` pour les classes conditionnelles** (via `clsx` + `tailwind-merge`)

### 5.2 Utilitaire `cn`

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ✅ Utilisation
<div className={cn(
  'flex items-center gap-2',
  isActive && 'bg-primary text-primary-foreground',
  className // prop externe
)} />
```

### 5.3 Tokens design via CSS variables

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    /* ... tokens shadcn/ui */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

### 5.4 Conventions Tailwind

```typescript
// ✅ Ordre des classes : layout → box model → typography → visual → interactif
<div className="flex flex-col gap-4 p-6 w-full max-w-md text-sm font-medium bg-card rounded-lg shadow-sm border transition-colors hover:bg-accent" />

// ✅ Responsive — mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />

// ✅ Dark mode via la classe CSS variable (shadcn gère ça)
<p className="text-foreground" />           // s'adapte auto au dark mode
<div className="bg-background" />

// ❌ INTERDIT — valeurs arbitraires sauf si nécessaire
<div className="w-[347px] h-[183px]" />    // préférer w-full, aspect-ratio, etc.

// ✅ Si valeur arbitraire vraiment nécessaire — commenter pourquoi
{/* Hauteur fixe requise pour l'intégration carte tierce */}
<div className="h-[360px]" />
```

### 5.5 Variants avec `cva`

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

---

## 6. shadcn/ui — Utilisation exclusive

### 6.1 Règle fondamentale

> **Utiliser exclusivement les composants shadcn/ui installés pour tout élément d'interface.**  
> Ne jamais créer un composant UI from scratch si un équivalent shadcn existe.

### 6.2 Installation des composants

```bash
# Toujours installer avant d'utiliser
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc.
```

### 6.3 Catalogue des composants disponibles

| Catégorie       | Composants                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Layout**      | `Card`, `Separator`, `ScrollArea`, `AspectRatio`, `ResizablePanel`                                |
| **Navigation**  | `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination`                                              |
| **Formulaires** | `Form`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `DatePicker` |
| **Feedback**    | `Alert`, `AlertDialog`, `Toast` (`Sonner`), `Progress`, `Skeleton`                                |
| **Overlays**    | `Dialog`, `Sheet`, `Popover`, `Tooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`               |
| **Data**        | `Table`, `DataTable`, `Badge`, `Avatar`                                                           |
| **Typo**        | Utiliser directement les classes Tailwind avec les tokens                                         |

### 6.4 Utilisation correcte des composants

```typescript
// ✅ Toujours importer depuis @/components/ui/
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// ✅ Formulaire avec react-hook-form + zod + shadcn Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

type FormValues = z.infer<typeof formSchema>

export function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: FormValues): void {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Se connecter
        </Button>
      </form>
    </Form>
  )
}
```

### 6.5 Extension des composants shadcn

```typescript
// ✅ Étendre un composant shadcn — ne jamais le modifier directement dans /ui/
// components/app-button.tsx
import { Button, type ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppButtonProps extends ButtonProps {
  isLoading?: boolean
}

export function AppButton({ isLoading, children, disabled, className, ...props }: AppButtonProps) {
  return (
    <Button
      disabled={disabled ?? isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

### 6.6 Toast / Notifications

```typescript
// ✅ Utiliser Sonner (intégré shadcn)
import { toast } from 'sonner'

// Dans un Client Component
toast.success('Utilisateur créé')
toast.error('Une erreur est survenue')
toast.promise(createUser(data), {
  loading: 'Création en cours...',
  success: 'Utilisateur créé avec succès',
  error: 'Erreur lors de la création',
})

// Dans le layout root
import { Toaster } from '@/components/ui/sonner'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

---

## 7. Skeletons & États de chargement

### 7.1 Règle fondamentale

> **Chaque section qui fetch des données doit avoir un skeleton correspondant.**  
> Utiliser le composant `Skeleton` de shadcn/ui exclusivement.

### 7.2 Création de skeletons

```typescript
// ✅ Skeleton qui mime exactement la forme du composant réel
// components/skeletons/user-card-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function UserCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-3 w-[140px]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[80%]" />
        <Skeleton className="h-3 w-[60%]" />
      </CardContent>
    </Card>
  )
}

// ✅ Skeleton de liste
export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

### 7.3 Intégration avec Suspense et `loading.tsx`

```typescript
// app/users/loading.tsx — automatiquement utilisé par Next.js
import { UserListSkeleton } from '@/components/skeletons/user-list-skeleton'

export default function UsersLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-8 w-48 mb-6" /> {/* Titre */}
      <UserListSkeleton count={6} />
    </div>
  )
}

// ✅ Suspense granulaire dans une page
import { Suspense } from 'react'
import { StatsSkeleton } from '@/components/skeletons'

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection /> {/* Server Component async */}
      </Suspense>
    </div>
  )
}
```

### 7.4 États de chargement dans les formulaires

```typescript
'use client'

import { useTransition } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPending ? 'Envoi...' : 'Envoyer'}
    </Button>
  )
}
```

---

## 8. Gestion des erreurs

### 8.1 Error Boundaries avec `error.tsx`

```typescript
// app/error.tsx ou app/[section]/error.tsx
'use client' // obligatoire pour error.tsx

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Une erreur est survenue</AlertTitle>
          <AlertDescription>
            {error.message || 'Erreur inattendue. Veuillez réessayer.'}
          </AlertDescription>
        </Alert>
        <Button onClick={reset} className="w-full">
          Réessayer
        </Button>
      </div>
    </div>
  )
}
```

### 8.2 Gestion des erreurs de fetch

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// lib/data/base.ts
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as Record<string, unknown>).message)
        : `Erreur ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}
```

### 8.3 `notFound()` et `redirect()`

```typescript
import { notFound, redirect } from 'next/navigation'

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) notFound() // affiche not-found.tsx
  if (!user.isActive) redirect('/suspended')

  return <UserProfile user={user} />
}
```

---

## 9. Structure des fichiers

```
├── app/                          # App Router
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                       # composants shadcn/ui — NE PAS modifier manuellement
│   ├── skeletons/                # un fichier par skeleton
│   │   ├── index.ts              # re-exports
│   │   ├── user-card-skeleton.tsx
│   │   └── ...
│   ├── forms/                    # formulaires métier
│   ├── layouts/                  # headers, sidebars, footers
│   └── [feature]/                # composants spécifiques à une feature
│
├── lib/
│   ├── utils.ts                  # cn() et utilitaires généraux
│   ├── data/                     # fonctions de fetch server-side
│   │   ├── users.ts
│   │   └── ...
│   ├── schemas/                  # schémas Zod + types inférés
│   │   ├── user.ts
│   │   └── ...
│   ├── errors.ts                 # classes d'erreur custom
│   └── constants.ts              # constantes applicatives
│
├── hooks/                        # hooks React custom ('use client')
│   ├── use-debounce.ts
│   └── ...
│
├── types/                        # types globaux non liés à un schéma Zod
│   ├── global.d.ts
│   └── ...
│
├── actions/                      # Server Actions
│   ├── users.ts
│   └── ...
│
├── middleware.ts                 # Edge Middleware
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 10. Conventions de nommage

| Élément               | Convention         | Exemple                |
| --------------------- | ------------------ | ---------------------- |
| Fichiers composants   | `kebab-case.tsx`   | `user-card.tsx`        |
| Fichiers utilitaires  | `kebab-case.ts`    | `format-date.ts`       |
| Composants React      | `PascalCase`       | `UserCard`             |
| Interfaces / Types    | `PascalCase`       | `UserCardProps`        |
| Variables / fonctions | `camelCase`        | `getUserById`          |
| Constantes globales   | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`      |
| Server Actions        | `camelCaseAction`  | `createUserAction`     |
| Hooks custom          | `useCamelCase`     | `useDebounce`          |
| CSS variables         | `--kebab-case`     | `--primary-foreground` |
| Route groups          | `(kebab-case)`     | `(dashboard)`          |
| Dynamic segments      | `[camelCase]`      | `[userId]`             |
| Catch-all             | `[...slug]`        | `[...slug]/page.tsx`   |

---

## 11. Performance

### 11.1 Images

```typescript
// ✅ Toujours utiliser next/image
import Image from 'next/image'

<Image
  src="/hero.webp"
  alt="Description explicite"
  width={1200}
  height={630}
  priority                    // pour les images above-the-fold
  className="rounded-lg object-cover"
/>

// ✅ Images dynamiques avec fill
<div className="relative aspect-video">
  <Image
    src={user.avatarUrl}
    alt={`Avatar de ${user.name}`}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover rounded-full"
  />
</div>
```

### 11.2 Fonts

```typescript
// app/layout.tsx
import { Inter, Geist } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

### 11.3 `dynamic` import

```typescript
import dynamic from 'next/dynamic'

// ✅ Composants lourds chargés à la demande
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // si accès à window/document
})
```

### 11.4 `useMemo` et `useCallback`

```typescript
"use client";

// ✅ Mémoriser uniquement les calculs coûteux ou les callbacks passés en props
const sortedUsers = useMemo(
  () => users.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [users],
);

const handleDelete = useCallback(
  (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  },
  [], // pas de deps → stable
);
```

---

## 12. Accessibilité

```typescript
// ✅ Labels explicites sur tous les inputs
<FormLabel htmlFor="email">Adresse email</FormLabel>
<Input id="email" type="email" aria-describedby="email-error" />
<FormMessage id="email-error" />

// ✅ Boutons avec texte ou aria-label
<Button aria-label="Supprimer l'utilisateur John">
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Focus visible
// Tailwind : focus-visible:ring-2 focus-visible:ring-ring (intégré dans shadcn)

// ✅ Structure sémantique
<main>
  <h1>Titre principal</h1>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Section</h2>
  </section>
</main>

// ✅ Dialogs accessibles — shadcn Dialog gère aria-modal, focus trap, etc.
<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
      <DialogDescription>Description obligatoire</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

---

## 13. Interdictions absolues

Ces patterns sont **strictement interdits** dans le codebase :

```typescript
// ❌ any sous toutes ses formes
const x: any = ...
function f(p: any) {}
value as any
<any>value

// ❌ Créer des composants UI from scratch si shadcn équivalent existe
// (bouton, input, dialog, toast, card, table, badge…)

// ❌ Fetch dans un Client Component (sauf mutation ou real-time)
'use client'
useEffect(() => { fetch('/api/data').then(...) }, []) // ← INTERDIT

// ❌ Modifier les fichiers dans components/ui/
// Étendre les composants dans components/ à la place

// ❌ Styles inline
<div style={{ color: 'red' }} />   // utiliser className="text-destructive"

// ❌ CSS modules sauf cas exceptionnel documenté
import styles from './button.module.css'

// ❌ Ignorer les erreurs TypeScript avec @ts-ignore
// @ts-ignore
// @ts-expect-error (sauf cas très précis avec commentaire obligatoire)

// ❌ console.log en production — utiliser un logger dédié
console.log(user) // supprimer avant merge

// ❌ Laisser des TODO sans ticket associé
// TODO: fix this  ← INTERDIT
// TODO(#123): fix this après merge de #456 ← OK

// ❌ Valeurs hardcodées de couleurs hors système de design
className="text-[#3b82f6]"  // utiliser text-primary, text-blue-500, etc.

// ❌ Images sans next/image
<img src="..." />  // utiliser <Image /> de next/image

// ❌ Liens sans next/link
<a href="/users">Utilisateurs</a>  // utiliser <Link href="/users">
```

---

> **Dernière mise à jour** : voir historique git  
> **Mainteneur** : équipe technique  
> Ce fichier est lu par Gemini CLI à chaque session de développement.
