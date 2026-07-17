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

const statements = ["PRAGMA foreign_keys = ON;", "DELETE FROM books_search;", "DELETE FROM book_press_reviews;", "DELETE FROM book_bibliographies;", "DELETE FROM books;", "DELETE FROM people;", "DELETE FROM organizations;"];
let bibliographyId = 1;
for (const [index, record] of books.entries()) {
  const id = index + 1;
  const title = first(record, ["Titre"]);
  const payload = { id, ...record };
  const searchText = Object.values(record).filter((value) => typeof value === "string" && value.trim()).join(" ");
  statements.push(`INSERT INTO books (id, title, sort_year, search_text, payload) VALUES (${id}, ${sql(title)}, ${numberOrNull(record["Année"])}, ${sql(searchText)}, ${sql(JSON.stringify(payload))});`);
  statements.push(`INSERT INTO books_search (rowid, title, search_text) VALUES (${id}, ${sql(title)}, ${sql(searchText)});`);
  const bibliography = bibliographyStatements(id, record, bibliographyId);
  bibliographyId = bibliography.nextId;
  statements.push(...bibliography.statements);
}
for (const [index, record] of people.entries()) {
  const id = index + 1;
  statements.push(`INSERT INTO people (id, name, payload) VALUES (${id}, ${sql(first(record, ["Prénom Nom", "Prenom Nom", "Auteur Original"]))}, ${sql(JSON.stringify({ id, ...record }))});`);
}
for (const [index, record] of organizations.entries()) {
  const id = index + 1;
  statements.push(`INSERT INTO organizations (id, name, payload) VALUES (${id}, ${sql(first(record, ["Organisme"]))}, ${sql(JSON.stringify({ id, ...record }))});`);
}
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ books: books.length, people: people.length, organizations: organizations.length, bibliographies: bibliographyId - 1, outputPath }) + "\n");
