interface D1Result<T> {
  results: T[];
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1Statement;
}

interface Env {
  DB: D1Database;
  STAVNET_DATA_API_SECRET: string;
}

type Filter = { field: string; operator: "eq" | "neq" | "is"; value: unknown };
type QueryPayload = {
  table?: string;
  columns?: string;
  filters?: Filter[];
  order?: { field: string; ascending: boolean }[];
  from?: number;
  to?: number;
  head?: boolean;
};

const TABLES = {
  "data-books": { table: "books", payload: true },
  "data-person": { table: "people", payload: true },
  "data-organism": { table: "organizations", payload: true },
  book_press_reviews: { table: "book_press_reviews", payload: false },
  star_showcase_config: { table: "star_showcase_config", payload: false },
} as const;

function isAuthorized(request: Request, env: Env): boolean {
  const secret = env.STAVNET_DATA_API_SECRET;
  return typeof secret === "string" && secret.length > 0 && request.headers.get("authorization") === `Bearer ${secret}`;
}

function response(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function parseNames(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((entry) => typeof entry === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function parsePayload(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function selectColumns(row: Record<string, unknown>, columns: string | undefined): Record<string, unknown> {
  if (!columns || columns === "*") return row;
  const selected: Record<string, unknown> = {};
  for (const rawColumn of columns.split(",")) {
    const column = rawColumn.trim().replaceAll('"', "");
    if (column && column in row) selected[column] = row[column];
  }
  if ("id" in row && !("id" in selected)) selected.id = row.id;
  return selected;
}

function fieldExpression(field: string, usesPayload: boolean): { expression: string; parameter?: string } | null {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(field) && ["id", "book_id", "position", "title", "sort_year", "name"].includes(field)) {
    return { expression: field };
  }
  if (!usesPayload || field.length === 0 || field.length > 160) {
    return null;
  }
  return { expression: "json_extract(payload, ?)", parameter: `$.${field}` };
}

async function queryRows(db: D1Database, payload: QueryPayload): Promise<{ data: Record<string, unknown>[]; count: number }> {
  const definition = payload.table ? TABLES[payload.table as keyof typeof TABLES] : null;
  if (!definition) {
    throw new Error("Unknown table");
  }
  const where: string[] = [];
  const values: unknown[] = [];
  for (const filter of payload.filters ?? []) {
    const field = fieldExpression(filter.field, definition.payload);
    if (!field || !["eq", "neq", "is"].includes(filter.operator)) {
      throw new Error("Invalid filter");
    }
    if (field.parameter) values.push(field.parameter);
    if (filter.operator === "is") {
      where.push(`${field.expression} IS ${filter.value === null ? "NULL" : "NOT NULL"}`);
    } else {
      where.push(`${field.expression} ${filter.operator === "eq" ? "=" : "<>"} ?`);
      values.push(filter.value);
    }
  }
  const whereClause = where.length > 0 ? ` WHERE ${where.join(" AND ")}` : "";
  const countResult = await db.prepare(`SELECT COUNT(*) AS count FROM ${definition.table}${whereClause}`).bind(...values).all<{ count: number }>();
  const order: string[] = [];
  const orderValues: unknown[] = [];
  for (const item of payload.order ?? []) {
    const field = fieldExpression(item.field, definition.payload);
    if (!field) throw new Error("Invalid order");
    if (field.parameter) orderValues.push(field.parameter);
    order.push(`${field.expression} ${item.ascending ? "ASC" : "DESC"}`);
  }
  if (order.length === 0) order.push("id ASC");
  const from = Math.max(0, Number.isFinite(payload.from) ? Math.floor(payload.from ?? 0) : 0);
  const to = Math.max(from, Number.isFinite(payload.to) ? Math.floor(payload.to ?? from + 999) : from + 999);
  const rows: D1Result<Record<string, unknown>> = payload.head ? { results: [] } : await db.prepare(`SELECT * FROM ${definition.table}${whereClause} ORDER BY ${order.join(", ")} LIMIT ? OFFSET ?`).bind(...values, ...orderValues, to - from + 1, from).all<Record<string, unknown>>();
  const data = rows.results.map((row) => selectColumns(definition.payload ? { id: row.id, ...parsePayload(String(row.payload ?? "{}")) } : row, payload.columns));
  return { data, count: Number(countResult.results[0]?.count ?? 0) };
}

function text(row: Record<string, unknown>, ...fields: string[]): string {
  for (const field of fields) {
    const value = row[field];
    if (value !== null && value !== undefined && String(value).trim()) return String(value).trim();
  }
  return "";
}

function paginate<T>(items: T[], pageValue: unknown, pageSizeValue: unknown): { items: T[]; totalCount: number; databaseTotal: number } {
  const page = Math.max(1, Number(pageValue) || 1);
  const pageSize = Math.max(1, Number(pageSizeValue) || 20);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), totalCount: items.length, databaseTotal: items.length };
}

async function rpc(db: D1Database, name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === "get_books_page") {
    const unsupported = ["p_person_last_name", "p_person_first_name", "p_organization", "p_theme", "p_publication_language", "p_year"].some((key) => String(args[key] ?? "").trim());
    if (unsupported) throw new Error("Could not find the function public.get_books_page");
    const search = String(args.p_general_search ?? args.p_search ?? args.p_title ?? "").trim();
    const page = Math.max(1, Number(args.p_page) || 1);
    const pageSize = Math.max(1, Number(args.p_page_size) || 20);
    const terms = search.split(/\s+/).map((term) => term.replaceAll('"', "").replaceAll("'", "")).filter(Boolean);
    const match = terms.map((term) => `"${term}"`).join(" AND ");
    const query = match ? "SELECT books.id, books.payload FROM books_search JOIN books ON books.id = books_search.rowid WHERE books_search MATCH ? ORDER BY rank LIMIT ? OFFSET ?" : "SELECT id, payload FROM books WHERE title <> '' AND title <> 'NULL' ORDER BY sort_year DESC, title ASC, id ASC LIMIT ? OFFSET ?";
    const countQuery = match ? "SELECT COUNT(*) AS count FROM books_search WHERE books_search MATCH ?" : "SELECT COUNT(*) AS count FROM books WHERE title <> '' AND title <> 'NULL'";
    const count = await db.prepare(countQuery).bind(...(match ? [match] : [])).all<{ count: number }>();
    const rows = await db.prepare(query).bind(...(match ? [match, pageSize, (page - 1) * pageSize] : [pageSize, (page - 1) * pageSize])).all<{ id: number; payload: string }>();
    const items = rows.results.map((entry) => {
      const row = parsePayload(entry.payload);
      return { id: entry.id, title: text(row, "Titre"), author: [text(row, "Auteur. 1. Nom"), text(row, "Auteur. 1. Prénom")].filter(Boolean).join(" "), publisher: text(row, "Éditeur. 1. Nom", "Éditeur"), language: text(row, "Langue"), writingLanguage: text(row, "Auteur. 1. Langue", "Auteur. 2. Langue", "Auteur. 3. Langue"), year: text(row, "Année"), publicationCode: text(row, "Année. Pages. Dimensions") };
    });
    return { items, totalCount: Number(count.results[0]?.count ?? 0), databaseTotal: 4998 };
  }
  if (name === "get_books_page_by_facet") throw new Error("Could not find the function public." + name);
  if (name === "get_persons_page" || name === "get_person_detail_by_name" || name === "get_default_person_detail") {
    const people = (await queryRows(db, { table: "data-person", from: 0, to: 2000 })).data;
    if (name === "get_persons_page") {
      const search = String(args.p_search ?? "").toLocaleLowerCase();
      const items = people.map((row) => ({
        name: text(row, "Prénom Nom", "Prenom Nom", "Auteur Original"), type: text(row, "Type Personne", "Type"), language: text(row, "Langue Écriture", "Langue", "Code Langue"),
        originalTitles: text(row, "Nb. Titres Originaux", "Nb. Contributions Auteurs"), translatedTitles: text(row, "Nb. Titres Traduits", "Nb. Contributions Titres"), translationLanguages: text(row, "Nb. Langues Traduction"), awards: text(row, "Nb. Prix Distinctions", "Nb. Prix"), regularReissues: text(row, "Nb. Rééditions Régulières", "Nb. Rééditions"), pocketReissues: text(row, "Nb. Rééditions Poche"), publicationCountries: text(row, "Nb. Pays Publication"),
      })).filter((item) => item.name && (!search || item.name.toLocaleLowerCase().includes(search))).sort((left, right) => left.name.localeCompare(right.name));
      return paginate(items, args.p_page, args.p_page_size);
    }
    const requested = name === "get_default_person_detail" ? "" : String(args.p_name ?? "").toLocaleLowerCase();
    const row = people.find((entry) => !requested || [text(entry, "Prénom Nom", "Prenom Nom"), text(entry, "Nom Prénom", "Nom Prenom"), text(entry, "Auteur Original")].some((value) => value.toLocaleLowerCase() === requested)) ?? (name === "get_default_person_detail" ? people.find((entry) => text(entry, "Prénom Nom", "Prenom Nom")) : undefined);
    if (!row) return null;
    return { name: text(row, "Prénom Nom", "Prenom Nom", "Auteur Original"), alternateName: text(row, "Nom Prénom", "Nom Prenom"), type: text(row, "Type Personne", "Type"), language: text(row, "Langue Écriture", "Langue", "Code Langue"), birthInfo: text(row, "Date de Naissance", "Date Naissance"), deathInfo: text(row, "Date de Décès", "Date Décès", "Date Deces"), residence: text(row, "Pays de Résidence", "Lieu Résidence", "Lieu Residence"), professionalActivity: text(row, "Activité Professionnelle", "Activite Professionnelle"), biography: text(row, "Biographie"), bibliographyStats: { originalTitles: text(row, "Nb. Titres Originaux", "Nb. Contributions Auteurs"), translations: text(row, "Nb. Titres Traduits", "Nb. Contributions Titres"), publicationLanguages: text(row, "Nb. Langues Traduction") }, bibliographyRows: [], stats: { cardsFound: text(row, "Nb. Fiches Trouvées", "Nb. Fiches Trouvees"), databaseContains: text(row, "Nb. Fiches Base") } };
  }
  if (name === "get_organizations_page" || name === "get_organization_detail_by_name" || name === "get_default_organization_detail") {
    const organizations = (await queryRows(db, { table: "data-organism", from: 0, to: 2000 })).data;
    if (name === "get_organizations_page") {
      const search = String(args.p_search ?? "").toLocaleLowerCase();
      const items = organizations.map((row) => ({ name: text(row, "Organisme"), type: text(row, "Type"), creationDate: text(row, "Date_Creation"), country: text(row, "Pays"), publishedTitles: text(row, "Nb_Titres"), publishedAuthors: text(row, "Nb_Auteurs") })).filter((item) => item.name && (!search || item.name.toLocaleLowerCase().includes(search))).sort((left, right) => left.name.localeCompare(right.name));
      return paginate(items, args.p_page, args.p_page_size);
    }
    const requested = name === "get_default_organization_detail" ? "" : String(args.p_name ?? "").toLocaleLowerCase();
    const row = organizations.find((entry) => !requested || text(entry, "Organisme").toLocaleLowerCase() === requested) ?? (name === "get_default_organization_detail" ? organizations.find((entry) => text(entry, "Organisme")) : undefined);
    if (!row) return null;
    const organizationName = text(row, "Organisme");
    const names = new Set([organizationName.toLocaleLowerCase()]);
    const books = await db.prepare("SELECT payload FROM books").all<{ payload: string }>();
    const seen = new Set<string>();
    const publishedRows = books.results.flatMap((entry) => {
      const book = parsePayload(entry.payload);
      const publishers = [text(book, "Éditeur"), text(book, "Éditeur. 1. Nom"), text(book, "Éditeur. 2. Nom")];
      if (!publishers.some((publisher) => names.has(publisher.toLocaleLowerCase()))) return [];
      const title = text(book, "Titre");
      const author = [text(book, "Auteur. 1. Prénom"), text(book, "Auteur. 1. Nom")].filter(Boolean).join(" ");
      const year = text(book, "Année");
      const key = `${title}|${author}|${year}`.toLocaleLowerCase();
      if (!title || seen.has(key)) return [];
      seen.add(key);
      return [{ title, author, year }];
    });
    const publishedTitles = text(row, "Nb_Titres") || String(publishedRows.length);
    const publishedAuthors = text(row, "Nb_Auteurs");
    return { name: organizationName, synonym: organizationName, type: text(row, "Type"), creationDate: text(row, "Date_Creation"), country: text(row, "Pays"), publishedStats: { titles: publishedTitles, authors: publishedAuthors }, stats: { cardsFound: publishedTitles, databaseContains: String(organizations.length) }, publishedRows };
  }
  throw new Error("Unknown RPC");
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!isAuthorized(request, env)) return response({ error: "Unauthorized" }, 401);
    const url = new URL(request.url);
    if (url.pathname === "/v1/health" && request.method === "GET") return response({ status: "ok" });
    if (url.pathname === "/v1/query" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") return response({ error: "Invalid query" }, 400);
      try { return response(await queryRows(env.DB, body as QueryPayload)); } catch (error) { return response({ error: error instanceof Error ? error.message : "Query failed" }, 400); }
    }
    if (url.pathname === "/v1/rpc" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object" || typeof (body as { name?: unknown }).name !== "string") return response({ error: "Invalid RPC" }, 400);
      try { return response({ data: await rpc(env.DB, (body as { name: string }).name, (body as { args?: Record<string, unknown> }).args ?? {}) }); } catch (error) { return response({ error: error instanceof Error ? error.message : "RPC failed" }, 404); }
    }
    if (url.pathname === "/v1/showcase" && request.method === "GET") {
      const result = await env.DB.prepare("SELECT selected_author_names FROM star_showcase_config WHERE id = ?").bind("default").all<{ selected_author_names: string }>();
      return response({ names: result.results[0] ? parseNames(result.results[0].selected_author_names) : [] });
    }
    if (url.pathname === "/v1/showcase" && request.method === "PUT") {
      const body = await request.json().catch(() => null);
      const names = typeof body === "object" && body !== null && "names" in body ? (body as { names: unknown }).names : null;
      if (!Array.isArray(names) || !names.every((name) => typeof name === "string")) return response({ error: "Invalid names" }, 400);
      await env.DB.prepare("INSERT INTO star_showcase_config (id, selected_author_names, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET selected_author_names = excluded.selected_author_names, updated_at = excluded.updated_at").bind("default", JSON.stringify(names), new Date().toISOString()).run();
      return response({ names });
    }
    return response({ error: "Not found" }, 404);
  },
};

export default worker;
