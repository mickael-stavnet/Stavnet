import { getPersonImageEntries, type PersonImageEntry } from "@/lib/person-images";

const MAX_SHOWCASE_COUNT = 12;

export type ShowcaseSource = "database" | "fallback";
export type ShowcaseSelection = { entries: PersonImageEntry[]; source: ShowcaseSource };

function workerUrl(): string {
  const value = process.env.STAVNET_DATA_WORKER_URL;
  if (!value) throw new Error("Missing required environment variable: STAVNET_DATA_WORKER_URL");
  return value;
}

function workerSecret(): string {
  const value = process.env.STAVNET_DATA_WORKER_SECRET;
  if (!value) throw new Error("Missing required environment variable: STAVNET_DATA_WORKER_SECRET");
  return value;
}

async function showcaseRequest(method: "GET" | "PUT", names?: string[]): Promise<string[]> {
  const response = await fetch(`${workerUrl()}/v1/showcase`, { method, headers: { Authorization: `Bearer ${workerSecret()}`, "Content-Type": "application/json" }, body: names ? JSON.stringify({ names }) : undefined, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof payload === "object" && payload !== null && "error" in payload ? String((payload as { error: unknown }).error) : "Showcase request failed");
  return typeof payload === "object" && payload !== null && "names" in payload && Array.isArray((payload as { names: unknown }).names) ? (payload as { names: unknown[] }).names.filter((name): name is string => typeof name === "string") : [];
}

export function normalizeShowcaseNames(names: unknown): string[] {
  if (!Array.isArray(names)) return [];
  const validEntries = new Map(getPersonImageEntries().map((entry) => [entry.name, entry]));
  const normalized: string[] = [];
  for (const value of names) {
    if (typeof value !== "string") continue;
    const name = value.trim();
    if (validEntries.has(name) && !normalized.includes(name)) normalized.push(name);
  }
  return normalized.slice(0, MAX_SHOWCASE_COUNT);
}

export function entriesFromNames(names: unknown): PersonImageEntry[] {
  const validEntries = new Map(getPersonImageEntries().map((entry) => [entry.name, entry]));
  return normalizeShowcaseNames(names).map((name) => validEntries.get(name)).filter((entry): entry is PersonImageEntry => Boolean(entry));
}

function fallbackSelection(): ShowcaseSelection {
  return { entries: getPersonImageEntries(), source: "fallback" };
}

export async function getShowcaseSelection(): Promise<ShowcaseSelection> {
  try {
    const entries = entriesFromNames(await showcaseRequest("GET"));
    return entries.length > 0 ? { entries, source: "database" } : fallbackSelection();
  } catch {
    return fallbackSelection();
  }
}

export async function getAdminShowcaseSelection(): Promise<PersonImageEntry[]> {
  return entriesFromNames(await showcaseRequest("GET"));
}

export async function saveAdminShowcaseSelection(names: unknown): Promise<PersonImageEntry[]> {
  return entriesFromNames(await showcaseRequest("PUT", normalizeShowcaseNames(names)));
}
