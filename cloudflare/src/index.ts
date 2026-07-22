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
  count?: boolean;
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
  return { expression: "json_extract(payload, ?)", parameter: `$.${JSON.stringify(field)}` };
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
  const countResult = payload.count ? await db.prepare(`SELECT COUNT(*) AS count FROM ${definition.table}${whereClause}`).bind(...values).all<{ count: number }>() : null;
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
  return { data, count: Number(countResult?.results[0]?.count ?? 0) };
}

async function stat(db: D1Database, key: string): Promise<number> {
  const result = await db.prepare("SELECT value FROM app_stats WHERE key = ?").bind(key).all<{ value: number }>();
  return Number(result.results[0]?.value ?? 0);
}

function text(row: Record<string, unknown>, ...fields: string[]): string {
  for (const field of fields) {
    const value = row[field];
    if (value !== null && value !== undefined && String(value).trim()) return String(value).trim();
  }
  return "";
}

function organizationAliasNames(row: Record<string, unknown>): string[] {
  const quality = row.dataQuality;
  if (typeof quality !== "object" || quality === null || Array.isArray(quality) || !("aliasNormalizedNames" in quality)) return [];
  const aliases = quality.aliasNormalizedNames;
  return Array.isArray(aliases) && aliases.every((entry) => typeof entry === "string") ? aliases.map(normalize) : [];
}

function personWritingLanguage(row: Record<string, unknown>): string {
  return text(row, "Langue Écriture", "Langue Ecriture", "Langue �criture", "Langue ï¿½criture", "Langue Ã‰criture", "Langue", "Code Langue");
}

function normalize(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function personNameTokens(value: string): string[] {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

function isAuthorNameVariant(value: string, personName: string): boolean {
  const authorTokens = personNameTokens(value);
  const personTokens = personNameTokens(personName);
  const surname = personTokens.at(-1);
  const givenNames = personTokens.slice(0, -1);

  return Boolean(
    surname
      && givenNames.length > 0
      && authorTokens.includes(surname)
      && givenNames.every((givenName) => authorTokens.some((authorToken) => authorToken.startsWith(givenName[0] ?? ""))),
  );
}

function bibliographyTypeFromPublicationCode(value: string): "Original" | "Traduction" {
  return normalize(value) === "t" ? "Traduction" : "Original";
}

function bibliographyRow(row: Record<string, unknown>): Record<string, string> {
  return { type: bibliographyTypeFromPublicationCode(text(row, "CodePublication")), language: text(row, "Langue Traduction", "Langue Traduite", "Langue de Traduction"), title: text(row, "Titre"), year: text(row, "Année Publication", "Annee Publication"), issue: text(row, "Cote Livre", "Côte Livre") };
}

function bookListItem(row: { book_id: number; title: string; author: string; publisher: string; language: string; writing_language: string; publication_year: string; publication_code: string }): Record<string, unknown> {
  return { id: row.book_id, title: row.title, author: row.author, publisher: row.publisher, language: row.language, writingLanguage: row.writing_language, year: row.publication_year, publicationCode: row.publication_code };
}

function personWhere(type: string, language: string, search: string): { sql: string; values: string[] } {
  const clauses: string[] = ["COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived'"];
  const values: string[] = [];
  if (type) { clauses.push("COALESCE(json_extract(payload, '$.\"Type Personne\"'), json_extract(payload, '$.Type'), '') = ?"); values.push(type); }
  if (language) { clauses.push("COALESCE(json_extract(payload, '$.\"Langue Écriture\"'), json_extract(payload, '$.\"Langue Ecriture\"'), json_extract(payload, '$.\"Langue �criture\"'), json_extract(payload, '$.\"Langue ï¿½criture\"'), json_extract(payload, '$.\"Langue Ã‰criture\"'), json_extract(payload, '$.Langue'), json_extract(payload, '$.\"Code Langue\"'), '') = ?"); values.push(language); }
  if (search) { clauses.push("normalized_name LIKE ?"); values.push(`%${search}%`); }
  return { sql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "", values };
}

function organizationWhere(type: string, category: string, country: string, search: string): { sql: string; values: string[] } {
  const clauses: string[] = ["COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived'"];
  const values: string[] = [];
  if (type) { clauses.push("json_extract(payload, '$.Type') = ?"); values.push(type); }
  if (category === "Editeur") { clauses.push("json_extract(payload, '$.Type') = 'Editeur'"); }
  if (category === "Bibliothèque") { clauses.push("json_extract(payload, '$.Type') = 'AutreOrganisme' AND normalized_name LIKE '%bibli%'"); }
  if (category === "AutreOrganisme") { clauses.push("json_extract(payload, '$.Type') = 'AutreOrganisme' AND normalized_name NOT LIKE '%bibli%'"); }
  if (country) { clauses.push("COALESCE(json_extract(payload, '$.Pays'), '') = ?"); values.push(country); }
  if (search) { clauses.push("normalized_name LIKE ?"); values.push(`%${search}%`); }
  return { sql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "", values };
}

async function rpc(db: D1Database, name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === "get_books_totals") {
    return { cardsFound: await stat(db, "books_valid"), databaseContains: await stat(db, "books_total") };
  }
  if (name === "get_book_ids_by_exact_title") {
    const title = String(args.p_title ?? "").trim();
    if (!title) return [];
    const rows = await db.prepare("SELECT id FROM books WHERE title = ?").bind(title).all<{ id: number }>();
    return rows.results.map((row) => row.id);
  }
  if (name === "get_book_publishing") {
    const value = normalize(String(args.p_work_title ?? ""));
    if (!value) return [];
    const books = await db.prepare("SELECT books.id, books.payload FROM book_work_titles JOIN books ON books.id = book_work_titles.book_id WHERE book_work_titles.value = ? ORDER BY books.sort_year, books.id").bind(value).all<{ id: number; payload: string }>();
    return books.results.map((entry) => ({ id: entry.id, ...parsePayload(entry.payload) }));
  }
  if (name === "get_books_page") {
    const unsupported = ["p_person_last_name", "p_person_first_name", "p_organization", "p_theme", "p_publication_language", "p_year"].some((key) => String(args[key] ?? "").trim());
    if (unsupported) throw new Error("Could not find the function public.get_books_page");
    const generalSearch = String(args.p_general_search ?? "").trim();
    const titleSearch = String(args.p_title ?? args.p_search ?? "").trim();
    const page = Math.max(1, Number(args.p_page) || 1);
    const pageSize = Math.max(1, Number(args.p_page_size) || 20);
    const generalTerms = generalSearch.split(/\s+/).map((term) => term.replaceAll('"', "").replaceAll("'", "")).filter(Boolean);
    const titleTerms = titleSearch.split(/\s+/).map((term) => normalize(term)).filter(Boolean);
    const generalMatch = generalTerms.map((term) => `"${term}"`).join(" AND ");
    const titleMatch = titleTerms.map((term) => `"${term}"`).join(" AND ");
    const query = generalMatch
      ? "SELECT book_list_items.book_id, book_list_items.title, book_list_items.author, book_list_items.publisher, book_list_items.language, book_list_items.writing_language, book_list_items.publication_year, book_list_items.publication_code FROM books_search JOIN book_list_items ON book_list_items.book_id = books_search.rowid WHERE books_search MATCH ? AND book_list_items.is_valid = 1 ORDER BY rank LIMIT ? OFFSET ?"
      : titleMatch
        ? "SELECT book_id, title, author, publisher, language, writing_language, publication_year, publication_code FROM book_list_items WHERE is_valid = 1 AND book_id IN (SELECT book_id FROM book_titles_search WHERE book_titles_search MATCH ?) ORDER BY sort_year DESC, title ASC, book_id ASC LIMIT ? OFFSET ?"
        : "SELECT book_id, title, author, publisher, language, writing_language, publication_year, publication_code FROM book_list_items WHERE is_valid = 1 ORDER BY sort_year DESC, title ASC, book_id ASC LIMIT ? OFFSET ?";
    const countQuery = generalMatch
      ? "SELECT COUNT(*) AS count FROM books_search JOIN book_list_items ON book_list_items.book_id = books_search.rowid WHERE books_search MATCH ? AND book_list_items.is_valid = 1"
      : titleMatch
        ? "SELECT COUNT(*) AS count FROM book_list_items WHERE is_valid = 1 AND book_id IN (SELECT book_id FROM book_titles_search WHERE book_titles_search MATCH ?)"
        : null;
    const match = generalMatch || titleMatch;
    const count = countQuery ? await db.prepare(countQuery).bind(match).all<{ count: number }>() : null;
    const rows = await db.prepare(query).bind(...(match ? [match, pageSize, (page - 1) * pageSize] : [pageSize, (page - 1) * pageSize])).all<{ book_id: number; title: string; author: string; publisher: string; language: string; writing_language: string; publication_year: string; publication_code: string }>();
    const items = rows.results.map(bookListItem);
    const databaseTotal = await stat(db, "books_total");
    return { items, totalCount: count ? Number(count.results[0]?.count ?? 0) : await stat(db, "books_valid"), databaseTotal };
  }
  if (name === "get_books_page_by_facet") {
    const facet = String(args.p_facet ?? "");
    const value = String(args.p_value ?? "");
    const page = Math.max(1, Number(args.p_page) || 1);
    const pageSize = Math.max(1, Number(args.p_page_size) || 20);
    const normalizedValue = normalize(value);
    const total = await db.prepare("SELECT COUNT(*) AS count FROM book_facets JOIN book_list_items ON book_list_items.book_id = book_facets.book_id WHERE book_facets.facet = ? AND book_facets.value = ? AND book_list_items.is_valid = 1").bind(facet, normalizedValue).all<{ count: number }>();
    const books = await db.prepare("SELECT book_list_items.book_id, book_list_items.title, book_list_items.author, book_list_items.publisher, book_list_items.language, book_list_items.writing_language, book_list_items.publication_year, book_list_items.publication_code FROM book_facets JOIN book_list_items ON book_list_items.book_id = book_facets.book_id WHERE book_facets.facet = ? AND book_facets.value = ? AND book_list_items.is_valid = 1 ORDER BY book_facets.sort_title, book_list_items.book_id LIMIT ? OFFSET ?").bind(facet, normalizedValue, pageSize, (page - 1) * pageSize).all<{ book_id: number; title: string; author: string; publisher: string; language: string; writing_language: string; publication_year: string; publication_code: string }>();
    const paged = books.results.map(bookListItem);
    return { items: paged, totalCount: Number(total.results[0]?.count ?? 0), databaseTotal: await stat(db, "books_total") };
  }
  if (name === "get_persons_page" || name === "get_person_detail_by_name" || name === "get_default_person_detail") {
    if (name === "get_persons_page") {
      const search = normalize(String(args.p_search ?? ""));
      const type = String(args.p_type ?? "").trim();
      const language = String(args.p_language ?? "").trim();
      const page = Math.max(1, Number(args.p_page) || 1);
      const pageSize = Math.max(1, Number(args.p_page_size) || 20);
      const where = personWhere(type, language, search);
      const total = await db.prepare(`SELECT COUNT(*) AS count FROM people${where.sql}`).bind(...where.values).all<{ count: number }>();
      const people = await db.prepare(`SELECT payload FROM people${where.sql} ORDER BY name LIMIT ? OFFSET ?`).bind(...where.values, pageSize, (page - 1) * pageSize).all<{ payload: string }>();
      const items = people.results.map((entry) => parsePayload(entry.payload)).map((row) => ({
        name: text(row, "Prénom Nom", "Prenom Nom", "Auteur Original"), type: text(row, "Type Personne", "Type"), language: personWritingLanguage(row),
        originalTitles: text(row, "Nb. Titres Originaux", "Nb. Contributions Auteurs"), translatedTitles: text(row, "Nb. Titres Traduits", "Nb. Contributions Titres"), translationLanguages: text(row, "Nb. Langues Traduction"), awards: text(row, "Nb. Prix Distinctions", "Nb. Prix"), regularReissues: text(row, "Nb. Rééditions Régulières", "Nb. Rééditions"), pocketReissues: text(row, "Nb. Rééditions Poche"), publicationCountries: text(row, "Nb. Pays Publication"),
      }));
      return { items, totalCount: Number(total.results[0]?.count ?? 0), databaseTotal: await stat(db, "people_total") };
    }
    const requested = normalize(String(args.p_name ?? ""));
    const person = await db.prepare(`SELECT payload FROM people WHERE COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived'${requested ? " AND normalized_name = ?" : ""} ORDER BY name LIMIT 1`).bind(...(requested ? [requested] : [])).all<{ payload: string }>();
    const row = person.results[0] ? parsePayload(person.results[0].payload) : undefined;
    if (!row) return null;
    const primaryName = text(row, "Prénom Nom", "Prenom Nom", "Auteur Original");
    const alternateName = text(row, "Nom Prénom", "Nom Prenom");
    const names = [primaryName, alternateName].map(normalize).filter((value, index, values) => value && values.indexOf(value) === index);
    const bibliographyRows: Record<string, string>[] = [];
    if (names.length) {
      const surname = personNameTokens(primaryName).at(-1);
      const authorNameVariants = surname
        ? await db.prepare("SELECT DISTINCT value FROM book_facets WHERE facet = 'authorName' AND value LIKE ?").bind(`%${surname}%`).all<{ value: string }>()
        : { results: [] as { value: string }[] };
      const relatedNames = [...names, ...authorNameVariants.results.map((entry) => entry.value).filter((value) => isAuthorNameVariant(value, primaryName))]
        .filter((value, index, values) => values.indexOf(value) === index);
      const placeholders = relatedNames.map(() => "?").join(", ");
      const books = await db.prepare(`SELECT DISTINCT books.id, books.payload FROM book_facets JOIN books ON books.id = book_facets.book_id WHERE book_facets.facet = 'authorName' AND book_facets.value IN (${placeholders}) ORDER BY books.sort_year DESC, books.id`).bind(...relatedNames).all<{ id: number; payload: string }>();
      for (const entry of books.results) { const book = parsePayload(entry.payload); bibliographyRows.push({ type: bibliographyTypeFromPublicationCode(text(book, "CodePublication")), language: text(book, "Langue"), title: text(book, "Titre"), year: text(book, "Année"), issue: "" }); }
    }
    const originalTitles = bibliographyRows.filter((entry) => normalize(entry.type) === "original").length;
    const translations = bibliographyRows.filter((entry) => normalize(entry.type) === "traduction");
    const publicationLanguages = new Set(translations.map((entry) => normalize(entry.language)).filter(Boolean)).size;
    return { name: primaryName, alternateName, type: text(row, "Type Personne", "Type"), language: personWritingLanguage(row), birthInfo: text(row, "Date de Naissance", "Date Naissance"), deathInfo: text(row, "Date de Décès", "Date Décès", "Date Deces"), residence: text(row, "Pays de Résidence", "Lieu Résidence", "Lieu Residence"), professionalActivity: text(row, "Activité Professionnelle", "Activite Professionnelle"), biography: text(row, "Biographie"), bibliographyStats: { originalTitles: String(originalTitles), translations: String(translations.length), publicationLanguages: String(publicationLanguages) }, bibliographyRows, stats: { cardsFound: String(bibliographyRows.length), databaseContains: String(await stat(db, "people_total")) } };
  }
  if (name === "get_organizations_page" || name === "get_organization_detail_by_name" || name === "get_default_organization_detail") {
    if (name === "get_organizations_page") {
      const search = normalize(String(args.p_search ?? ""));
      const type = String(args.p_type ?? "").trim();
      const category = String(args.p_category ?? "").trim();
      const country = String(args.p_country ?? "").trim();
      const page = Math.max(1, Number(args.p_page) || 1);
      const pageSize = Math.max(1, Number(args.p_page_size) || 20);
      const where = organizationWhere(type, category, country, search);
      const total = await db.prepare(`SELECT COUNT(*) AS count FROM organizations${where.sql}`).bind(...where.values).all<{ count: number }>();
      const organizations = await db.prepare(`SELECT payload FROM organizations${where.sql} ORDER BY name LIMIT ? OFFSET ?`).bind(...where.values, pageSize, (page - 1) * pageSize).all<{ payload: string }>();
      const items = await Promise.all(organizations.results.map(async (entry) => {
        const row = parsePayload(entry.payload);
        const aliases = organizationAliasNames(row);
        const names = [...new Set([normalize(text(row, "Organisme")), ...aliases].filter(Boolean))];
        const placeholders = names.map(() => "?").join(", ");
        const counts = names.length > 0 ? await db.prepare(`SELECT COUNT(DISTINCT book_id) AS titles, (SELECT COUNT(DISTINCT value) FROM book_facets WHERE facet = 'authorName' AND book_id IN (SELECT book_id FROM book_publishers WHERE normalized_name IN (${placeholders}))) AS authors FROM book_publishers WHERE normalized_name IN (${placeholders})`).bind(...names, ...names).all<{ titles: number; authors: number }>() : { results: [] as { titles: number; authors: number }[] };
        return { name: text(row, "Organisme"), type: text(row, "Type"), creationDate: text(row, "Date_Creation"), country: text(row, "Pays"), publishedTitles: String(counts.results[0]?.titles ?? 0), publishedAuthors: String(counts.results[0]?.authors ?? 0) };
      }));
      return { items, totalCount: Number(total.results[0]?.count ?? 0), databaseTotal: await stat(db, "organizations_total") };
    }
    const requested = normalize(String(args.p_name ?? ""));
    const organization = await db.prepare(`SELECT payload FROM organizations${requested ? " WHERE normalized_name = ? AND COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived'" : " WHERE COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived'"} ORDER BY name LIMIT 1`).bind(...(requested ? [requested] : [])).all<{ payload: string }>();
    const row = organization.results[0] ? parsePayload(organization.results[0].payload) : undefined;
    if (!row) return null;
    const organizationName = text(row, "Organisme");
    const aliases = organizationAliasNames(row);
    const names = [...new Set([normalize(organizationName), ...aliases].filter(Boolean))];
    const placeholders = names.map(() => "?").join(", ");
    const books = names.length > 0 ? await db.prepare(`SELECT DISTINCT books.id, books.payload FROM book_publishers JOIN books ON books.id = book_publishers.book_id WHERE book_publishers.normalized_name IN (${placeholders}) ORDER BY books.sort_year DESC, books.id ASC`).bind(...names).all<{ id: number; payload: string }>() : { results: [] as { id: number; payload: string }[] };
    const seen = new Set<string>();
    const publishedRows = books.results.flatMap((entry) => {
      const book = parsePayload(entry.payload);
      const title = text(book, "Titre");
      const author = [text(book, "Auteur. 1. Prénom"), text(book, "Auteur. 1. Nom")].filter(Boolean).join(" ");
      const year = text(book, "Année");
      const key = `${title}|${author}|${year}`.toLocaleLowerCase();
      if (!title || seen.has(key)) return [];
      seen.add(key);
      return [{ title, author, year }];
    });
    const publishedTitles = String(books.results.length);
    const authorCount = names.length > 0 ? await db.prepare(`SELECT COUNT(DISTINCT value) AS authors FROM book_facets WHERE facet = 'authorName' AND book_id IN (SELECT book_id FROM book_publishers WHERE normalized_name IN (${placeholders}))`).bind(...names).all<{ authors: number }>() : { results: [] as { authors: number }[] };
    const publishedAuthors = String(authorCount.results[0]?.authors ?? 0);
    return { name: organizationName, synonym: organizationName, type: text(row, "Type"), creationDate: text(row, "Date_Creation"), country: text(row, "Pays"), publishedStats: { titles: publishedTitles, authors: publishedAuthors }, stats: { cardsFound: publishedTitles, databaseContains: String(await stat(db, "organizations_total")) }, publishedRows };
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
