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
  batch(statements: D1Statement[]): Promise<unknown[]>;
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

type AdminEntityType = "books" | "persons" | "organizations";
type AdminEntityDefinition = {
  table: "books" | "people" | "organizations";
  payloadLabel: string[];
  secondaryLabel: string[];
};

type AdminMutationPayload = {
  payload?: unknown;
  version?: unknown;
  confirmDuplicate?: unknown;
  imageKey?: unknown;
  personLinks?: unknown;
  organizationLinks?: unknown;
};

const TABLES = {
  "data-books": { table: "books", payload: true },
  "data-person": { table: "people", payload: true },
  "data-organism": { table: "organizations", payload: true },
  book_press_reviews: { table: "book_press_reviews", payload: false },
  star_showcase_config: { table: "star_showcase_config", payload: false },
} as const;

const ADMIN_ENTITIES: Record<AdminEntityType, AdminEntityDefinition> = {
  books: { table: "books", payloadLabel: ["Titre"], secondaryLabel: ["Auteur. 1. Nom", "Éditeur. 1. Nom", "Année"] },
  persons: { table: "people", payloadLabel: ["Prénom Nom", "Prenom Nom", "Auteur Original"], secondaryLabel: ["Type Personne", "Type", "Langue Écriture"] },
  organizations: { table: "organizations", payloadLabel: ["Organisme"], secondaryLabel: ["Type", "Pays"] },
};

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
  if (definition.table === "books" || definition.table === "people" || definition.table === "organizations") {
    where.push("COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived'");
  }
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
    return { name: primaryName, alternateName, imageSrc: text(row, "Image. URL"), type: text(row, "Type Personne", "Type"), language: personWritingLanguage(row), birthInfo: text(row, "Date de Naissance", "Date Naissance"), deathInfo: text(row, "Date de Décès", "Date Décès", "Date Deces"), residence: text(row, "Pays de Résidence", "Lieu Résidence", "Lieu Residence"), professionalActivity: text(row, "Activité Professionnelle", "Activite Professionnelle"), biography: text(row, "Biographie"), bibliographyStats: { originalTitles: String(originalTitles), translations: String(translations.length), publicationLanguages: String(publicationLanguages) }, bibliographyRows, stats: { cardsFound: String(bibliographyRows.length), databaseContains: String(await stat(db, "people_total")) } };
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

function adminEntityType(value: string): AdminEntityType | null {
  return value === "books" || value === "persons" || value === "organizations" ? value : null;
}

function adminPayload(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function adminLabel(payload: Record<string, unknown>, definition: AdminEntityDefinition): string {
  return text(payload, ...definition.payloadLabel) || "Sans titre";
}

function adminSecondary(payload: Record<string, unknown>, definition: AdminEntityDefinition): string {
  return definition.secondaryLabel.map((field) => text(payload, field)).filter(Boolean).join(" · ");
}

function adminStatus(payload: Record<string, unknown>, archivedAt: string | null): "active" | "archived" {
  const quality = payload.dataQuality;
  return archivedAt || (typeof quality === "object" && quality !== null && "status" in quality && quality.status === "archived") ? "archived" : "active";
}

function normalizedAdminLabel(label: string): string {
  return normalize(label);
}

async function duplicateRecords(db: D1Database, entityType: AdminEntityType, label: string, excludedId: number | null): Promise<Array<{ id: number; label: string }>> {
  const definition = ADMIN_ENTITIES[entityType];
  const field = entityType === "books" ? "title" : "normalized_name";
  const value = entityType === "books" ? label : normalizedAdminLabel(label);
  const suffix = excludedId === null ? "" : " AND id <> ?";
  const result = await db.prepare(`SELECT id, ${entityType === "books" ? "title" : "name"} AS label FROM ${definition.table} WHERE ${field} = ? AND archived_at IS NULL${suffix} LIMIT 8`).bind(value, ...(excludedId === null ? [] : [excludedId])).all<{ id: number; label: string }>();
  return result.results;
}

async function adminList(db: D1Database, entityType: AdminEntityType, params: URLSearchParams): Promise<unknown> {
  const definition = ADMIN_ENTITIES[entityType];
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pageSize = Math.min(50, Math.max(5, Number(params.get("pageSize") ?? "20") || 20));
  const search = normalize(params.get("q") ?? "");
  const status = params.get("status") === "archived" ? "archived" : "active";
  const statusClause = entityType === "books"
    ? status === "archived" ? "archived_at IS NOT NULL" : "is_valid = 1 AND archived_at IS NULL"
    : status === "archived" ? "archived_at IS NOT NULL" : "archived_at IS NULL";
  const searchColumn = entityType === "books" ? "search_text" : "normalized_name";
  const searchClause = search ? ` AND ${searchColumn} LIKE ?` : "";
  const values: unknown[] = search ? [`%${search}%`] : [];
  const count = await db.prepare(`SELECT COUNT(*) AS count FROM ${definition.table} WHERE ${statusClause}${searchClause}`).bind(...values).all<{ count: number }>();
  const rows = await db.prepare(`SELECT id, payload, created_at, updated_at, archived_at, version, image_key FROM ${definition.table} WHERE ${statusClause}${searchClause} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`).bind(...values, pageSize, (page - 1) * pageSize).all<{ id: number; payload: string; created_at: string; updated_at: string; archived_at: string | null; version: number; image_key: string | null }>();
  const total = Number(count.results[0]?.count ?? 0);
  return {
    items: rows.results.map((row) => {
      const payload = parsePayload(row.payload);
      return { id: row.id, entityType, label: adminLabel(payload, definition), secondary: adminSecondary(payload, definition), status: adminStatus(payload, row.archived_at), version: row.version, payload, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at, imageKey: row.image_key };
    }),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function adminSchema(db: D1Database, entityType: AdminEntityType): Promise<{ fields: string[] }> {
  const definition = ADMIN_ENTITIES[entityType];
  const result = await db.prepare(`SELECT DISTINCT json_each.key AS field FROM ${definition.table}, json_each(${definition.table}.payload) WHERE json_each.type NOT IN ('object', 'array') AND json_each.key NOT IN ('id', 'dataQuality', 'Image. URL') ORDER BY json_each.key`).all<{ field: string }>();
  return { fields: result.results.map((entry) => entry.field).filter(Boolean) };
}

async function adminRecord(db: D1Database, entityType: AdminEntityType, id: number): Promise<unknown | null> {
  const definition = ADMIN_ENTITIES[entityType];
  const rows = await db.prepare(`SELECT id, payload, created_at, updated_at, archived_at, version, image_key FROM ${definition.table} WHERE id = ?`).bind(id).all<{ id: number; payload: string; created_at: string; updated_at: string; archived_at: string | null; version: number; image_key: string | null }>();
  const row = rows.results[0];
  if (!row) return null;
  const payload = parsePayload(row.payload);
  if (entityType !== "books") {
    const linkedBooks = entityType === "persons"
      ? await db.prepare("SELECT books.id, books.title, books.archived_at, link.role FROM book_person_links AS link JOIN books ON books.id = link.book_id WHERE link.person_id = ? ORDER BY books.sort_year DESC, books.title").bind(id).all<{ id: number; title: string; archived_at: string | null; role: string }>()
      : await db.prepare("SELECT books.id, books.title, books.archived_at, link.role FROM book_organization_links AS link JOIN books ON books.id = link.book_id WHERE link.organization_id = ? ORDER BY books.sort_year DESC, books.title").bind(id).all<{ id: number; title: string; archived_at: string | null; role: string }>();
    return { id: row.id, entityType, label: adminLabel(payload, definition), secondary: adminSecondary(payload, definition), status: adminStatus(payload, row.archived_at), version: row.version, payload, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at, imageKey: row.image_key, linkedBooks: linkedBooks.results.map((book) => ({ bookId: book.id, label: book.title, role: book.role, archived: Boolean(book.archived_at) })) };
  }
  const personLinks = await db.prepare("SELECT link.person_id AS id, link.role, people.name, people.archived_at FROM book_person_links AS link JOIN people ON people.id = link.person_id WHERE link.book_id = ? ORDER BY link.position").bind(id).all<{ id: number; role: string; name: string; archived_at: string | null }>();
  const organizationLinks = await db.prepare("SELECT link.organization_id AS id, link.role, organizations.name, organizations.archived_at FROM book_organization_links AS link JOIN organizations ON organizations.id = link.organization_id WHERE link.book_id = ? ORDER BY link.position").bind(id).all<{ id: number; role: string; name: string; archived_at: string | null }>();
  return { id: row.id, entityType, label: adminLabel(payload, definition), secondary: adminSecondary(payload, definition), status: adminStatus(payload, row.archived_at), version: row.version, payload, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at, imageKey: row.image_key, personLinks: personLinks.results.map((link) => ({ personId: link.id, role: link.role, label: link.name, archived: Boolean(link.archived_at) })), organizationLinks: organizationLinks.results.map((link) => ({ organizationId: link.id, role: link.role, label: link.name, archived: Boolean(link.archived_at) })) };
}

function auditStatement(db: D1Database, action: string, entityType: AdminEntityType, id: number, label: string, summary: string, before: unknown, after: unknown): D1Statement {
  return db.prepare("INSERT INTO admin_audit_logs (id, occurred_at, action, entity_type, entity_id, entity_label, summary, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), new Date().toISOString(), action, entityType, id, label, summary, JSON.stringify(before ?? null), JSON.stringify(after ?? null));
}

function bookProjectionStatements(db: D1Database, id: number, payload: Record<string, unknown>, isValid: number): D1Statement[] {
  const title = text(payload, "Titre");
  const author = [text(payload, "Auteur. 1. Nom"), text(payload, "Auteur. 1. Prénom")].filter(Boolean).join(" ");
  const publisher = text(payload, "Éditeur. 1. Nom", "Éditeur");
  const writingLanguage = text(payload, "Auteur. 1. Langue", "Auteur. 2. Langue", "Auteur. 3. Langue");
  const year = text(payload, "Année");
  const statements = [
    db.prepare("DELETE FROM book_list_items WHERE book_id = ?").bind(id),
    db.prepare("DELETE FROM books_search WHERE rowid = ?").bind(id),
    db.prepare("DELETE FROM book_titles_search WHERE book_id = ?").bind(id),
    db.prepare("DELETE FROM book_work_titles WHERE book_id = ?").bind(id),
    db.prepare("DELETE FROM book_facets WHERE book_id = ?").bind(id),
    db.prepare("DELETE FROM book_publishers WHERE book_id = ?").bind(id),
    db.prepare("INSERT INTO book_list_items (book_id, title, sort_year, author, publisher, language, writing_language, publication_year, publication_code, is_valid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, title, Number(year) || null, author, publisher, text(payload, "Langue"), writingLanguage, year, text(payload, "Année. Pages. Dimensions"), isValid),
    db.prepare("INSERT INTO books_search (rowid, title, search_text) VALUES (?, ?, ?)").bind(id, title, Object.values(payload).map(String).join(" ")),
  ];
  for (const value of new Set([title, text(payload, "Titre. Original"), text(payload, "Titre. Anglais"), text(payload, "Titre. Transcription")].filter(Boolean))) {
    const normalized = normalize(value);
    statements.push(db.prepare("INSERT OR IGNORE INTO book_work_titles (book_id, value) VALUES (?, ?)").bind(id, normalized));
    statements.push(db.prepare("INSERT INTO book_titles_search (book_id, value) VALUES (?, ?)").bind(id, normalized));
  }
  const facets = new Map<string, string[]>([
    ["translationLanguage", [text(payload, "Langue")]],
    ["category", [text(payload, "Catégorie. 1"), text(payload, "Catégorie. 2")]],
    ["subject", [text(payload, "Thème. 1"), text(payload, "Thème. 2")]],
    ["genre", [text(payload, "Genre"), text(payload, "Genre. 1"), text(payload, "Genre. 2")]],
    ["targetAudience", [text(payload, "Rubrique")]],
    ["publisherName", [text(payload, "Éditeur. 1. Nom", "Éditeur"), text(payload, "Éditeur. 2. Nom")]],
    ["publisherCountry", [text(payload, "Éditeur. 1. Pays", "Pays. Éditeur"), text(payload, "Éditeur. 2. Pays")]],
  ]);
  for (let index = 1; index <= 3; index += 1) {
    facets.set("authorName", [...(facets.get("authorName") ?? []), [text(payload, `Auteur. ${index}. Prénom`), text(payload, `Auteur. ${index}. Nom`)].filter(Boolean).join(" ")]);
    facets.set("authorType", [...(facets.get("authorType") ?? []), text(payload, `Auteur. ${index}. Type`)]);
    facets.set("authorWritingLanguage", [...(facets.get("authorWritingLanguage") ?? []), text(payload, `Auteur. ${index}. Langue`)]);
  }
  for (const [facet, values] of facets) for (const value of new Set(values.filter(Boolean))) statements.push(db.prepare("INSERT OR IGNORE INTO book_facets (book_id, facet, value, sort_title) VALUES (?, ?, ?, ?)").bind(id, facet, normalize(value), normalize(title)));
  [[text(payload, "Éditeur. 1. Nom", "Éditeur"), text(payload, "Éditeur. 1. Pays", "Pays. Éditeur")], [text(payload, "Éditeur. 2. Nom"), text(payload, "Éditeur. 2. Pays")]].forEach(([name, country], index) => { if (name || country) statements.push(db.prepare("INSERT OR REPLACE INTO book_publishers (book_id, position, name, normalized_name, country) VALUES (?, ?, ?, ?, ?)").bind(id, index + 1, name, normalize(name), country)); });
  return statements;
}

function relationStatements(db: D1Database, bookId: number, body: AdminMutationPayload, now: string): D1Statement[] {
  const statements = [db.prepare("DELETE FROM book_person_links WHERE book_id = ?").bind(bookId), db.prepare("DELETE FROM book_organization_links WHERE book_id = ?").bind(bookId)];
  if (Array.isArray(body.personLinks)) {
    body.personLinks.forEach((value, index) => { if (typeof value === "object" && value !== null && "personId" in value && "role" in value && typeof value.personId === "number" && typeof value.role === "string") statements.push(db.prepare("INSERT INTO book_person_links (book_id, person_id, role, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(bookId, value.personId, value.role, index + 1, now, now)); });
  }
  if (Array.isArray(body.organizationLinks)) {
    body.organizationLinks.forEach((value, index) => { if (typeof value === "object" && value !== null && "organizationId" in value && "role" in value && typeof value.organizationId === "number" && typeof value.role === "string") statements.push(db.prepare("INSERT INTO book_organization_links (book_id, organization_id, role, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(bookId, value.organizationId, value.role, index + 1, now, now)); });
  }
  return statements;
}

async function adminCreateOrUpdate(db: D1Database, entityType: AdminEntityType, id: number | null, body: AdminMutationPayload): Promise<{ record?: unknown; error?: string; status?: number }> {
  const definition = ADMIN_ENTITIES[entityType];
  const payload = adminPayload(body.payload);
  if (!payload) return { error: "payload must be an object", status: 400 };
  const label = adminLabel(payload, definition).trim();
  if (!label || label === "Sans titre") return { error: `${entityType === "books" ? "Titre" : "Nom"} obligatoire`, status: 400 };
  if (entityType === "organizations" && !text(payload, "Type")) return { error: "Type obligatoire", status: 400 };
  const duplicates = await duplicateRecords(db, entityType, label, id);
  if (duplicates.length && body.confirmDuplicate !== true) return { error: "Doublon potentiel détecté", status: 409, record: { duplicates } };
  const now = new Date().toISOString();
  const imageKey = typeof body.imageKey === "string" && (/^https:\/\/[A-Za-z0-9-]+\.public\.blob\.vercel-storage\.com\/(books|persons|organizations)\/[A-Za-z0-9._-]+(?:\?.*)?$/.test(body.imageKey) || /^\/images\/books-cover\/[A-Za-z0-9._ -]+\.(?:jpg|jpeg|png|webp)$/i.test(body.imageKey)) ? body.imageKey : null;
  if (id === null) {
    const ids = await db.prepare(`SELECT COALESCE(MAX(id), 0) + 1 AS id FROM ${definition.table}`).all<{ id: number }>();
    const nextId = Number(ids.results[0]?.id ?? 1);
    const storedPayload = { ...payload, ...(imageKey ? { "Image. URL": imageKey } : {}), id: nextId, dataQuality: { ...(adminPayload(payload.dataQuality) ?? {}), status: "canonical" } };
    if (entityType === "books") {
      await db.batch([
        db.prepare("INSERT INTO books (id, title, sort_year, search_text, payload, is_valid, created_at, updated_at, version, image_key) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 1, ?)").bind(nextId, label, Number(text(payload, "Année")) || null, Object.values(storedPayload).map(String).join(" "), JSON.stringify(storedPayload), now, now, imageKey),
        ...bookProjectionStatements(db, nextId, storedPayload, 1),
        ...relationStatements(db, nextId, body, now),
        auditStatement(db, "create", entityType, nextId, label, `Création de ${label}`, null, storedPayload),
      ]);
    } else {
      const name = label;
      await db.batch([
        db.prepare(`INSERT INTO ${definition.table} (id, name, normalized_name, payload, created_at, updated_at, version, image_key) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`).bind(nextId, name, normalizedAdminLabel(name), JSON.stringify(storedPayload), now, now, imageKey),
        auditStatement(db, "create", entityType, nextId, label, `Création de ${label}`, null, storedPayload),
      ]);
    }
    return { record: await adminRecord(db, entityType, nextId) };
  }
  const current = await adminRecord(db, entityType, id) as { version: number; payload: Record<string, unknown>; label: string } | null;
  if (!current) return { error: "Fiche introuvable", status: 404 };
  if (Number(body.version) !== current.version) return { error: "Cette fiche a été modifiée par un autre administrateur.", status: 409 };
  const storedPayload = { ...payload, ...(imageKey ? { "Image. URL": imageKey } : {}), id, dataQuality: { ...(adminPayload(payload.dataQuality) ?? {}), status: "canonical" } };
  if (entityType === "books") {
    await db.batch([
      db.prepare("UPDATE books SET title = ?, sort_year = ?, search_text = ?, payload = ?, image_key = ?, updated_at = ?, version = version + 1, archived_at = NULL WHERE id = ? AND version = ?").bind(label, Number(text(payload, "Année")) || null, Object.values(storedPayload).map(String).join(" "), JSON.stringify(storedPayload), imageKey, now, id, current.version),
      ...bookProjectionStatements(db, id, storedPayload, 1),
      ...relationStatements(db, id, body, now),
      auditStatement(db, "update", entityType, id, label, `Modification de ${label}`, current.payload, storedPayload),
    ]);
  } else {
    await db.batch([
      db.prepare(`UPDATE ${definition.table} SET name = ?, normalized_name = ?, payload = ?, image_key = ?, updated_at = ?, version = version + 1, archived_at = NULL WHERE id = ? AND version = ?`).bind(label, normalizedAdminLabel(label), JSON.stringify(storedPayload), imageKey, now, id, current.version),
      auditStatement(db, "update", entityType, id, label, `Modification de ${label}`, current.payload, storedPayload),
    ]);
  }
  return { record: await adminRecord(db, entityType, id) };
}

async function adminArchive(db: D1Database, entityType: AdminEntityType, id: number, action: "archive" | "restore" | "purge"): Promise<{ error?: string; status?: number }> {
  const definition = ADMIN_ENTITIES[entityType];
  const current = await adminRecord(db, entityType, id) as { payload: Record<string, unknown>; label: string } | null;
  if (!current) return { error: "Fiche introuvable", status: 404 };
  if (action === "purge") {
    await db.batch([db.prepare(`DELETE FROM ${definition.table} WHERE id = ?`).bind(id), auditStatement(db, "purge", entityType, id, current.label, `Suppression définitive de ${current.label}`, current.payload, null)]);
    return {};
  }
  if (action === "restore" && entityType !== "books") {
    const conflicts = await duplicateRecords(db, entityType, current.label, id);
    if (conflicts.length) return { error: "Une fiche active porte déjà ce nom. Renommez la fiche archivée avant de la restaurer.", status: 409 };
  }
  const now = new Date().toISOString();
  const payload = { ...current.payload, dataQuality: { ...(adminPayload(current.payload.dataQuality) ?? {}), status: action === "archive" ? "archived" : "canonical" } };
  if (entityType === "books") {
    await db.batch([
      db.prepare("UPDATE books SET payload = ?, archived_at = ?, updated_at = ?, version = version + 1 WHERE id = ?").bind(JSON.stringify(payload), action === "archive" ? now : null, now, id),
      ...bookProjectionStatements(db, id, payload, action === "archive" ? 0 : 1),
      auditStatement(db, action, entityType, id, current.label, `${action === "archive" ? "Archivage" : "Restauration"} de ${current.label}`, current.payload, payload),
    ]);
  } else {
    await db.batch([
      db.prepare(`UPDATE ${definition.table} SET payload = ?, archived_at = ?, updated_at = ?, version = version + 1 WHERE id = ?`).bind(JSON.stringify(payload), action === "archive" ? now : null, now, id),
      auditStatement(db, action, entityType, id, current.label, `${action === "archive" ? "Archivage" : "Restauration"} de ${current.label}`, current.payload, payload),
    ]);
  }
  return {};
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!isAuthorized(request, env)) return response({ error: "Unauthorized" }, 401);
    const adminMatch = url.pathname.match(/^\/v1\/admin\/(books|persons|organizations)(?:\/(\d+))?(?:\/(archive|restore|purge))?$/);
    if (adminMatch) {
      const entityType = adminEntityType(adminMatch[1] ?? "");
      if (!entityType) return response({ error: "Unknown entity" }, 404);
      const id = adminMatch[2] ? Number(adminMatch[2]) : null;
      const action = adminMatch[3];
      if (request.method === "GET" && id === null) return response(await adminList(env.DB, entityType, url.searchParams));
      if (request.method === "GET" && id !== null) {
        const record = await adminRecord(env.DB, entityType, id);
        return record ? response(record) : response({ error: "Not found" }, 404);
      }
      if (request.method === "POST" && id === null) {
        const result = await adminCreateOrUpdate(env.DB, entityType, null, await request.json().catch(() => null) as AdminMutationPayload);
        return result.error ? response({ error: result.error }, result.status ?? 400) : response(result.record, 201);
      }
      if (request.method === "PATCH" && id !== null && !action) {
        const result = await adminCreateOrUpdate(env.DB, entityType, id, await request.json().catch(() => null) as AdminMutationPayload);
        return result.error ? response({ error: result.error }, result.status ?? 400) : response(result.record);
      }
      if (request.method === "POST" && id !== null && (action === "archive" || action === "restore" || action === "purge")) {
        const result = await adminArchive(env.DB, entityType, id, action);
        return result.error ? response({ error: result.error }, result.status ?? 400) : response({ ok: true });
      }
      return response({ error: "Method not allowed" }, 405);
    }
    const adminSchemaMatch = url.pathname.match(/^\/v1\/admin\/(books|persons|organizations)\/schema$/);
    if (adminSchemaMatch && request.method === "GET") {
      const entityType = adminEntityType(adminSchemaMatch[1] ?? "");
      return entityType ? response(await adminSchema(env.DB, entityType)) : response({ error: "Unknown entity" }, 404);
    }
    if (url.pathname === "/v1/admin/logs" && request.method === "GET") {
      const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
      const pageSize = 25;
      const result = await env.DB.prepare("SELECT id, occurred_at AS occurredAt, action, entity_type AS entityType, entity_id AS entityId, entity_label AS entityLabel, summary FROM admin_audit_logs ORDER BY occurred_at DESC LIMIT ? OFFSET ?").bind(pageSize, (page - 1) * pageSize).all<Record<string, unknown>>();
      return response({ items: result.results, page, pageSize });
    }
    if (url.pathname === "/v1/admin/trash" && request.method === "GET") {
      const [books, persons, organizations] = await Promise.all([
        adminList(env.DB, "books", new URLSearchParams({ status: "archived", pageSize: "50" })),
        adminList(env.DB, "persons", new URLSearchParams({ status: "archived", pageSize: "50" })),
        adminList(env.DB, "organizations", new URLSearchParams({ status: "archived", pageSize: "50" })),
      ]);
      return response({ books, persons, organizations });
    }
    if (url.pathname === "/v1/admin/search" && request.method === "GET") {
      const query = url.searchParams.get("q") ?? "";
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      const search = async (entityType: AdminEntityType) => {
        const active = await adminList(env.DB, entityType, new URLSearchParams({ q: query, status: "active", pageSize: "20" })) as { items: unknown[]; total: number; page: number; pageSize: number; totalPages: number };
        if (!includeArchived) return active;
        const archived = await adminList(env.DB, entityType, new URLSearchParams({ q: query, status: "archived", pageSize: "20" })) as { items: unknown[]; total: number };
        const total = active.total + archived.total;
        return { ...active, items: [...active.items, ...archived.items].slice(0, 20), total, totalPages: Math.max(1, Math.ceil(total / 20)) };
      };
      const [books, persons, organizations] = await Promise.all([search("books"), search("persons"), search("organizations")]);
      return response({ books, persons, organizations });
    }
    if (url.pathname === "/v1/admin/relations" && request.method === "GET") {
      const requested = url.searchParams.get("entityType");
      const entityType = requested === "persons" || requested === "organizations" ? requested : null;
      if (!entityType) return response({ error: "entityType invalide" }, 400);
      const result = await adminList(env.DB, entityType, new URLSearchParams({ q: url.searchParams.get("q") ?? "", status: "active", pageSize: "10" })) as { items: unknown[] };
      return response({ items: result.items });
    }
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
