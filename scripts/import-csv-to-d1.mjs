import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourceDirectory = process.env.STAVNET_DATA_DIR;
const outputPath = process.env.STAVNET_D1_IMPORT_FILE ?? resolve("cloudflare", ".generated", "import.sql");

if (!sourceDirectory) throw new Error("STAVNET_DATA_DIR is required");

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("\u0000", "").replaceAll("'", "''")}'`;
}

function numberOrNull(value) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? String(Math.trunc(parsed)) : "NULL";
}

async function* rows(path, encoding = "utf8") {
  const stream = createReadStream(path, { encoding });
  let field = "";
  let row = [];
  let quoted = false;
  let quotePending = false;
  for await (const chunk of stream) {
    for (const character of chunk) {
      if (quotePending) {
        if (character === '"') { field += '"'; quotePending = false; continue; }
        quoted = false;
        quotePending = false;
      }
      if (quoted) {
        if (character === '"') quotePending = true;
        else field += character;
        continue;
      }
      if (character === '"' && field.length === 0) { quoted = true; continue; }
      if (character === ";") { row.push(field); field = ""; continue; }
      if (character === "\n") { row.push(field.replace(/\r$/, "")); yield row; row = []; field = ""; continue; }
      field += character;
    }
  }
  if (quotePending) quoted = false;
  if (quoted) throw new Error(`Unclosed quoted field in ${path}`);
  if (field.length > 0 || row.length > 0) { row.push(field.replace(/\r$/, "")); yield row; }
}

async function loadCsv(fileName, encoding) {
  const iterator = rows(resolve(sourceDirectory, fileName), encoding);
  const first = await iterator.next();
  if (first.done) throw new Error(`${fileName} is empty`);
  const headers = first.value.map((header) => header.replace(/^\uFEFF/, "").trim());
  const result = [];
  for await (const values of iterator) {
    if (values.every((value) => value.length === 0)) continue;
    const record = {};
    headers.forEach((header, index) => { record[header] = values[index] ?? ""; });
    result.push(record);
  }
  return result;
}

function first(record, fields) {
  for (const field of fields) if (String(record[field] ?? "").trim()) return String(record[field]).trim();
  return "";
}

function normalize(value) {
  return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function addFacetStatements(statements, bookId, record, title) {
  const values = new Map([
    ["translationLanguage", [first(record, ["Langue"])]],
    ["category", [first(record, ["Catégorie. 1"]), first(record, ["Catégorie. 2"])]],
    ["subject", [first(record, ["Thème. 1"]), first(record, ["Thème. 2"])]],
    ["genre", [first(record, ["Genre"]), first(record, ["Genre. 1"]), first(record, ["Genre. 2"])]],
    ["targetAudience", [first(record, ["Rubrique"])]],
    ["publisherName", [first(record, ["Éditeur", "Éditeur. 1. Nom"]), first(record, ["Éditeur. 2. Nom"])]],
    ["publisherCountry", [first(record, ["Pays. Éditeur", "Éditeur. 1. Pays"]), first(record, ["Éditeur. 2. Pays"])]],
  ]);
  for (let index = 1; index <= 3; index += 1) {
    values.set("authorName", [...(values.get("authorName") ?? []), [first(record, [`Auteur. ${index}. Prénom`]), first(record, [`Auteur. ${index}. Nom`])].filter(Boolean).join(" ")]);
    values.set("authorType", [...(values.get("authorType") ?? []), first(record, [`Auteur. ${index}. Type`])]);
    values.set("authorWritingLanguage", [...(values.get("authorWritingLanguage") ?? []), first(record, [`Auteur. ${index}. Langue`])]);
  }
  for (let index = 1; index <= 10; index += 1) {
    values.set("contributorName", [...(values.get("contributorName") ?? []), [first(record, [`Contrib. ${index}. Prénom`]), first(record, [`Contrib. ${index}. Nom`])].filter(Boolean).join(" ")]);
    values.set("contributorType", [...(values.get("contributorType") ?? []), first(record, [`Contrib. ${index}. Genre/Langue`])]);
    values.set("contributorLanguage", [...(values.get("contributorLanguage") ?? []), first(record, [`Contrib. ${index}. Langue Traduite`])]);
  }
  for (const [facet, entries] of values) {
    for (const entry of new Set(entries.filter((value) => value && !/^\d{5}-[A-Z]-L\d{2}-[A-Z]-E\d{2}$/i.test(value)))) {
      statements.push(`INSERT OR IGNORE INTO book_facets (book_id, facet, value, sort_title) VALUES (${bookId}, ${sql(facet)}, ${sql(normalize(entry))}, ${sql(normalize(title))});`);
    }
  }
}

function publisherStatements(bookId, record) {
  const values = [
    [first(record, ["Éditeur. 1. Nom", "Éditeur"]), first(record, ["Éditeur. 1. Pays", "Pays. Éditeur"])],
    [first(record, ["Éditeur. 2. Nom"]), first(record, ["Éditeur. 2. Pays"])],
  ];
  return values.flatMap(([name, country], index) => name || country ? [`INSERT OR REPLACE INTO book_publishers (book_id, position, name, normalized_name, country) VALUES (${bookId}, ${index + 1}, ${sql(name)}, ${sql(normalize(name))}, ${sql(country)});`] : []);
}

function workTitleStatements(bookId, record) {
  const values = ["Titre. Original", "Titre. Anglais", "Titre. Transcription", "Titre"].map((field) => first(record, [field])).filter(Boolean);
  return [...new Set(values)].flatMap((value) => [
    `INSERT OR IGNORE INTO book_work_titles (book_id, value) VALUES (${bookId}, ${sql(normalize(value))});`,
    `INSERT INTO book_titles_search (book_id, value) VALUES (${bookId}, ${sql(normalize(value))});`,
  ]);
}

function bookListItemStatement(bookId, record, title, isValid) {
  const author = [first(record, ["Auteur. 1. Nom"]), first(record, ["Auteur. 1. Prénom"])].filter(Boolean).join(" ");
  const publisher = first(record, ["Éditeur. 1. Nom", "Éditeur"]);
  const writingLanguage = first(record, ["Auteur. 1. Langue", "Auteur. 2. Langue", "Auteur. 3. Langue"]);
  return `INSERT INTO book_list_items (book_id, title, sort_year, author, publisher, language, writing_language, publication_year, publication_code, is_valid) VALUES (${bookId}, ${sql(title)}, ${numberOrNull(record["Année"])}, ${sql(author)}, ${sql(publisher)}, ${sql(first(record, ["Langue"]))}, ${sql(writingLanguage)}, ${sql(first(record, ["Année"]))}, ${sql(first(record, ["Année. Pages. Dimensions"]))}, ${isValid});`;
}

function bibliographyStatements(bookId, record, startId) {
  const statements = [];
  let identifier = startId;
  for (let position = 1; position <= 4; position += 1) {
    const name = first(record, [`Biblio. ${position}. Nom`]);
    const type = first(record, [`Biblio. ${position}. Type`]);
    const shelfmark = first(record, [`Biblio. ${position}. Cote`]);
    const city = first(record, [`Biblio. ${position}. Ville`]);
    const source = first(record, [`Biblio. ${position}. Source`]);
    if ([name, type, shelfmark, city, source].some(Boolean)) statements.push(`INSERT INTO book_bibliographies (id, book_id, position, name, type, shelfmark, city, source) VALUES (${identifier++}, ${bookId}, ${position}, ${sql(name)}, ${sql(type)}, ${sql(shelfmark)}, ${sql(city)}, ${sql(source)});`);
  }
  return { statements, nextId: identifier };
}

const [books, people, organizations] = await Promise.all([loadCsv("books.csv", "utf8"), loadCsv("data-person.csv", "latin1"), loadCsv("data-organisme.csv", "utf8")]);
if (books.length !== 4998) throw new Error(`Expected 4998 books, received ${books.length}`);
if (people.length !== 1231) throw new Error(`Expected 1231 people, received ${people.length}`);
if (organizations.length < 1200) throw new Error(`Expected at least 1200 organizations, received ${organizations.length}`);

const statements = ["PRAGMA foreign_keys = ON;", "DELETE FROM books_search;", "DELETE FROM book_titles_search;", "DELETE FROM book_list_items;", "DELETE FROM book_facets;", "DELETE FROM book_publishers;", "DELETE FROM book_work_titles;", "DELETE FROM app_stats;", "DELETE FROM book_press_reviews;", "DELETE FROM book_bibliographies;", "DELETE FROM books;", "DELETE FROM people;", "DELETE FROM organizations;"];
let bibliographyId = 1;
let validBooks = 0;
for (const [index, record] of books.entries()) {
  const id = index + 1;
  const title = first(record, ["Titre"]);
  const isValid = title && title !== "NULL" ? 1 : 0;
  const payload = { id, ...record };
  const searchText = Object.values(record).filter((value) => typeof value === "string" && value.trim()).join(" ");
  statements.push(`INSERT INTO books (id, title, sort_year, search_text, payload, is_valid) VALUES (${id}, ${sql(title)}, ${numberOrNull(record["Année"])}, ${sql(searchText)}, ${sql(JSON.stringify(payload))}, ${isValid});`);
  statements.push(`INSERT INTO books_search (rowid, title, search_text) VALUES (${id}, ${sql(title)}, ${sql(searchText)});`);
  statements.push(bookListItemStatement(id, record, title, isValid));
  addFacetStatements(statements, id, record, title);
  statements.push(...publisherStatements(id, record));
  statements.push(...workTitleStatements(id, record));
  const bibliography = bibliographyStatements(id, record, bibliographyId);
  bibliographyId = bibliography.nextId;
  statements.push(...bibliography.statements);
  validBooks += isValid;
}
for (const [index, record] of people.entries()) {
  const id = index + 1;
  const name = first(record, ["Prénom Nom", "Prenom Nom", "Auteur Original"]);
  statements.push(`INSERT INTO people (id, name, normalized_name, payload) VALUES (${id}, ${sql(name)}, ${sql(normalize(name))}, ${sql(JSON.stringify({ id, ...record }))});`);
}
for (const [index, record] of organizations.entries()) {
  const id = index + 1;
  const name = first(record, ["Organisme"]);
  statements.push(`INSERT INTO organizations (id, name, normalized_name, payload) VALUES (${id}, ${sql(name)}, ${sql(normalize(name))}, ${sql(JSON.stringify({ id, ...record }))});`);
}
statements.push(`INSERT INTO app_stats (key, value) VALUES ('books_total', ${books.length}), ('books_valid', ${validBooks}), ('people_total', ${people.length}), ('organizations_total', ${organizations.length});`);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ books: books.length, people: people.length, organizations: organizations.length, bibliographies: bibliographyId - 1, outputPath }) + "\n");
