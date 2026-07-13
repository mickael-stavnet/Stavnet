import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPersonImageEntries, type PersonImageEntry } from "@/lib/person-images";

const TABLE_NAME = "star_showcase_config";
const CONFIG_ID = "default";
const MAX_SHOWCASE_COUNT = 12;

type ShowcaseConfigRow = {
  selected_author_names: string[] | null;
};

export type ShowcaseSource = "database" | "fallback";

export type ShowcaseSelection = {
  entries: PersonImageEntry[];
  source: ShowcaseSource;
};

function getPublicSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase public environment variables are missing");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function getPrivilegedSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = secretKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are missing");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export function normalizeShowcaseNames(names: unknown): string[] {
  if (!Array.isArray(names)) {
    return [];
  }

  const validEntries = new Map(getPersonImageEntries().map((entry) => [entry.name, entry]));
  const normalized: string[] = [];
  for (const value of names) {
    if (typeof value !== "string") {
      continue;
    }
    const name = value.trim();
    if (validEntries.has(name) && !normalized.includes(name)) {
      normalized.push(name);
    }
  }

  return normalized.slice(0, MAX_SHOWCASE_COUNT);
}

export function entriesFromNames(names: unknown): PersonImageEntry[] {
  const validEntries = new Map(getPersonImageEntries().map((entry) => [entry.name, entry]));
  return normalizeShowcaseNames(names)
    .map((name) => validEntries.get(name))
    .filter((entry): entry is PersonImageEntry => Boolean(entry));
}

function fallbackSelection(): ShowcaseSelection {
  return { entries: getPersonImageEntries(), source: "fallback" };
}

export async function getShowcaseSelection(): Promise<ShowcaseSelection> {
  try {
    const { data, error } = await getPublicSupabaseClient()
      .from(TABLE_NAME)
      .select("selected_author_names")
      .eq("id", CONFIG_ID)
      .maybeSingle<ShowcaseConfigRow>();

    if (error) {
      console.warn("[StarShowcase] public selection read failed", { code: error.code });
      return fallbackSelection();
    }

    const entries = entriesFromNames(data?.selected_author_names);
    return entries.length > 0 ? { entries, source: "database" } : fallbackSelection();
  } catch (error) {
    console.warn("[StarShowcase] public selection unavailable", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return fallbackSelection();
  }
}

export async function getAdminShowcaseSelection(): Promise<PersonImageEntry[]> {
  const { data, error } = await getPrivilegedSupabaseClient()
    .from(TABLE_NAME)
    .select("selected_author_names")
    .eq("id", CONFIG_ID)
    .maybeSingle<ShowcaseConfigRow>();
  if (error) {
    throw new Error(`Admin showcase selection read failed: ${error.message}`);
  }

  return entriesFromNames(data?.selected_author_names);
}

export async function saveAdminShowcaseSelection(names: unknown): Promise<PersonImageEntry[]> {
  const selectedAuthorNames = normalizeShowcaseNames(names);
  const { data, error } = await getPrivilegedSupabaseClient()
    .from(TABLE_NAME)
    .upsert(
      {
        id: CONFIG_ID,
        selected_author_names: selectedAuthorNames,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("selected_author_names")
    .single<ShowcaseConfigRow>();
  if (error) {
    throw new Error(`Admin showcase selection save failed: ${error.message}`);
  }

  return entriesFromNames(data.selected_author_names);
}
