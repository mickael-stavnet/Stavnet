type Filter = { field: string; operator: "eq" | "neq" | "is"; value: unknown };
type Order = { field: string; ascending: boolean };
export type DataClientResult<T> = { data: T | null; error: { message: string } | null; count: number | null; status: number; statusText: string };

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function request<T>(path: string, body: unknown): Promise<{ data: T | null; error: { message: string } | null; status: number; statusText: string }> {
  try {
    const response = await fetch(`${required("STAVNET_DATA_WORKER_URL")}${path}`, { method: "POST", headers: { Authorization: `Bearer ${required("STAVNET_DATA_WORKER_SECRET")}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) return { data: null, error: { message: typeof payload === "object" && payload !== null && "error" in payload ? String((payload as { error: unknown }).error) : response.statusText }, status: response.status, statusText: response.statusText };
    return { data: payload as T, error: null, status: response.status, statusText: response.statusText };
  } catch (error) { return { data: null, error: { message: error instanceof Error ? error.message : "Worker request failed" }, status: 500, statusText: "Worker request failed" }; }
}

class Query<T extends Record<string, unknown>> implements PromiseLike<DataClientResult<T[]>> {
  private readonly filters: Filter[] = []; private readonly orders: Order[] = []; private from = 0; private to = 999; private head = false;
  constructor(private readonly table: string, private readonly wantsCount = false) {}
  select(columns = "*", options?: { count?: "exact"; head?: boolean }): this { void columns; this.head = options?.head ?? false; return this; }
  eq(field: string, value: unknown): this { this.filters.push({ field, operator: "eq", value }); return this; }
  neq(field: string, value: unknown): this { this.filters.push({ field, operator: "neq", value }); return this; }
  not(field: string, operator: "is", value: unknown): this { this.filters.push({ field, operator, value }); return this; }
  filter(field: string, operator: "eq", value: unknown): this { this.filters.push({ field: field.replaceAll('"', ""), operator, value }); return this; }
  order(field: string, options?: { ascending?: boolean }): this { this.orders.push({ field: field.replaceAll('"', ""), ascending: options?.ascending ?? true }); return this; }
  range(from: number, to: number): this { this.from = from; this.to = to; return this; }
  limit(limit: number): this { this.to = this.from + Math.max(0, limit - 1); return this; }
  maybeSingle(): Promise<DataClientResult<T | null>> { return this.executeSingle(); }
  single(): Promise<DataClientResult<T>> { return this.executeSingle() as Promise<DataClientResult<T>>; }
  then<TResult1 = DataClientResult<T[]>, TResult2 = never>(onfulfilled?: ((value: DataClientResult<T[]>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> { return this.execute().then(onfulfilled, onrejected); }
  private async execute(): Promise<DataClientResult<T[]>> { const result = await request<{ data: T[]; count: number }>("/v1/query", { table: this.table, filters: this.filters, order: this.orders, from: this.from, to: this.to, head: this.head }); return { data: result.data?.data ?? null, error: result.error, count: this.wantsCount ? result.data?.count ?? null : null, status: result.status, statusText: result.statusText }; }
  private async executeSingle(): Promise<DataClientResult<T | null>> { const result = await this.execute(); return { ...result, data: result.data?.[0] ?? null }; }
}

export const d1Client = {
  from<T extends Record<string, unknown>>(table: string): { select(columns?: string, options?: { count?: "exact"; head?: boolean }): Query<T> } { return { select: (columns = "*", options) => new Query<T>(table, options?.count === "exact").select(columns, options) }; },
  async rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<DataClientResult<T>> { const result = await request<{ data: T }>("/v1/rpc", { name, args }); return { data: result.data?.data ?? null, error: result.error, count: null, status: result.status, statusText: result.statusText }; },
};
