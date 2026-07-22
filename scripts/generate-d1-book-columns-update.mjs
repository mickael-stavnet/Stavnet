import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dataDirectory = process.env.STAVNET_DATA_DIR ?? resolve("..", "DATA");
const outputPath = process.env.STAVNET_D1_UPDATE_FILE ?? resolve("cloudflare", ".generated", "update-book-columns.sql");
const basePath = resolve(dataDirectory, "books-data.csv");
const addedPath = resolve(dataDirectory, "new-books-data.csv");
const addedIds = new Set([5000, 5001, 5002, 5003, 5012, 5013, 5054]);
const newColumns = ["CodePublication", "NombrePages", "AutreOrganisme01 DateMAJ", "CodeManuscrit", "CodeEdition", "CodePaysParution1", "AutreOrganisme01 CoteLivre", "AutreOrganisme01 Nom", "AutreOrganisme01 TypeLibellé"];

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("\u0000", "").replaceAll("'", "''")}'`;
}

function numberOrNull(value) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isInteger(parsed) ? String(parsed) : "NULL";
}

function first(record, fields) {
  for (const field of fields) {
    const value = String(record[field] ?? "").trim();
    if (value) return value;
  }
  return "";
}

function normalize(value) {
  return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

async function* rows(path) {
  const stream = createReadStream(path, { encoding: "utf8" });
  let field = "";
  let row = [];
  let quoted = false;
  let quotePending = false;
  for await (const chunk of stream) {
    for (const character of chunk) {
      if (quotePending) {
        if (character === '"') {
          field += '"';
          quotePending = false;
          continue;
        }
        quoted = false;
        quotePending = false;
      }
      if (quoted) {
        if (character === '"') quotePending = true;
        else field += character;
        continue;
      }
      if (character === '"' && field.length === 0) {
        quoted = true;
        continue;
      }
      if (character === ",") {
        row.push(field);
        field = "";
        continue;
      }
      if (character === "\n") {
        row.push(field.replace(/\r$/, ""));
        yield row;
        row = [];
        field = "";
        continue;
      }
      field += character;
    }
  }
  if (quotePending) quoted = false;
  if (quoted) throw new Error(`Unclosed quoted field in ${path}`);
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    yield row;
  }
}

async function loadCsv(path) {
  const iterator = rows(path);
  const firstRow = await iterator.next();
  if (firstRow.done) throw new Error(`${path} is empty`);
  const headers = firstRow.value.map((header) => header.replace(/^\uFEFF/, "").trim());
  const records = [];
  for await (const values of iterator) {
    if (values.every((value) => !value.length)) continue;
    if (values.length !== headers.length) throw new Error(`${path} has ${values.length} values where ${headers.length} are expected`);
    records.push(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  }
  return { headers, records };
}

function correctedRecord(record) {
  if (record["Année"] !== "20222") return record;
  return { ...record, "Année": "2022", "Année. Pages. Dimensions": String(record["Année. Pages. Dimensions"]).replace("20222", "2022") };
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
      statements.push(`INSERT INTO book_facets (book_id, facet, value, sort_title) VALUES (${bookId}, ${sql(facet)}, ${sql(normalize(entry))}, ${sql(normalize(title))});`);
    }
  }
}

function addBookStatements(statements, id, record) {
  const title = first(record, ["Titre"]);
  const isValid = title && title !== "NULL" ? 1 : 0;
  const payload = JSON.stringify({ id, ...record });
  const searchText = Object.values(record).filter((value) => typeof value === "string" && value.trim()).join(" ");
  const author = [first(record, ["Auteur. 1. Nom"]), first(record, ["Auteur. 1. Prénom"])].filter(Boolean).join(" ");
  const publisher = first(record, ["Éditeur. 1. Nom", "Éditeur"]);
  const writingLanguage = first(record, ["Auteur. 1. Langue", "Auteur. 2. Langue", "Auteur. 3. Langue"]);
  statements.push(`INSERT INTO books (id, title, sort_year, search_text, payload, is_valid) VALUES (${id}, ${sql(title)}, ${numberOrNull(record["Année"])}, ${sql(searchText)}, ${sql(payload)}, ${isValid});`);
  statements.push(`INSERT INTO books_search (rowid, title, search_text) VALUES (${id}, ${sql(title)}, ${sql(searchText)});`);
  statements.push(`INSERT INTO book_list_items (book_id, title, sort_year, author, publisher, language, writing_language, publication_year, publication_code, is_valid) VALUES (${id}, ${sql(title)}, ${numberOrNull(record["Année"])}, ${sql(author)}, ${sql(publisher)}, ${sql(first(record, ["Langue"]))}, ${sql(writingLanguage)}, ${sql(first(record, ["Année"]))}, ${sql(first(record, ["Année. Pages. Dimensions"]))}, ${isValid});`);
  addFacetStatements(statements, id, record, title);
  const publishers = [[first(record, ["Éditeur. 1. Nom", "Éditeur"]), first(record, ["Éditeur. 1. Pays", "Pays. Éditeur"])], [first(record, ["Éditeur. 2. Nom"]), first(record, ["Éditeur. 2. Pays"])]];
  for (const [index, [name, country]] of publishers.entries()) if (name || country) statements.push(`INSERT INTO book_publishers (book_id, position, name, normalized_name, country) VALUES (${id}, ${index + 1}, ${sql(name)}, ${sql(normalize(name))}, ${sql(country)});`);
  const titles = ["Titre. Original", "Titre. Anglais", "Titre. Transcription", "Titre"].map((field) => first(record, [field])).filter(Boolean);
  for (const value of new Set(titles)) statements.push(`INSERT INTO book_work_titles (book_id, value) VALUES (${id}, ${sql(normalize(value))});`);
}

const [base, added] = await Promise.all([loadCsv(basePath), loadCsv(addedPath)]);
if (base.records.length !== 4998) throw new Error(`Expected 4998 base rows, received ${base.records.length}`);
if (added.records.length !== 56) throw new Error(`Expected 56 added rows, received ${added.records.length}`);
if (base.headers.join("\u0000") !== added.headers.join("\u0000")) throw new Error("CSV headers differ");
for (const column of newColumns) if (!base.headers.includes(column)) throw new Error(`Missing ${column}`);

const statements = [];
for (const [index, original] of base.records.entries()) {
  const record = correctedRecord(original);
  const assignments = newColumns.flatMap((column) => [`'$.${column}'`, sql(record[column])]).join(", ");
  statements.push(`UPDATE books SET payload = json_set(payload, ${assignments}) WHERE id = ${index + 1};`);
}
for (const [index, original] of added.records.entries()) {
  const id = 4999 + index;
  const record = correctedRecord(original);
  if (addedIds.has(id)) addBookStatements(statements, id, record);
  else {
    const assignments = newColumns.flatMap((column) => [`'$.${column}'`, sql(record[column])]).join(", ");
    statements.push(`UPDATE books SET payload = json_set(payload, ${assignments}) WHERE id = ${id};`);
    if (record["Année"] === "2022") statements.push(`UPDATE books SET sort_year = 2022 WHERE id = ${id};`);
  }
}
statements.push("UPDATE app_stats SET value = (SELECT COUNT(*) FROM books) WHERE key = 'books_total';");
statements.push("UPDATE app_stats SET value = (SELECT COUNT(*) FROM books WHERE is_valid = 1) WHERE key = 'books_valid';");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ outputPath, baseUpdates: base.records.length, addedUpdates: added.records.length - addedIds.size, insertedBooks: addedIds.size }) + "\n");
