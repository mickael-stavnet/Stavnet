import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dataDirectory = process.env.STAVNET_TABLE_OF_CONTENTS_DATA_DIR ?? resolve(process.cwd(), "..", "DATA");
const booksPath = process.env.STAVNET_TABLE_OF_CONTENTS_BOOKS_FILE ?? resolve(dataDirectory, "import-table-de-matiere.csv");
const entriesPath = process.env.STAVNET_TABLE_OF_CONTENTS_ENTRIES_FILE ?? resolve(dataDirectory, "import-entrees-table-de-matiere.csv");
const outputPath = process.env.STAVNET_TABLE_OF_CONTENTS_SQL_FILE ?? resolve(process.cwd(), "cloudflare", ".generated", "import-table-of-contents.sql");

function text(value) {
  return String(value ?? "").trim();
}

function integer(value, field, rowNumber) {
  const parsed = Number.parseInt(text(value), 10);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${field} invalide à la ligne ${rowNumber}.`);
  }
  return parsed;
}

function boolean(value, field, rowNumber) {
  const normalized = text(value).toLocaleLowerCase();
  if (["", "0", "false", "non", "no"].includes(normalized)) {
    return 0;
  }
  if (["1", "true", "oui", "yes"].includes(normalized)) {
    return 1;
  }
  throw new Error(`${field} invalide à la ligne ${rowNumber}.`);
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && character === ";") {
      row.push(value);
      value = "";
      continue;
    }

    if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  if (quoted) {
    throw new Error("Champ CSV non terminé.");
  }

  return rows;
}

function loadCsv(path, requiredHeaders) {
  const rows = parseCsv(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
  const [headers = [], ...dataRows] = rows;
  const normalizedHeaders = headers.map(text);
  for (const header of requiredHeaders) {
    if (!normalizedHeaders.includes(header)) {
      throw new Error(`Colonne obligatoire absente : ${header}.`);
    }
  }
  return dataRows
    .filter((row) => row.some((value) => text(value)))
    .map((row, index) => ({ rowNumber: index + 2, value: Object.fromEntries(normalizedHeaders.map((header, column) => [header, text(row[column])])) }));
}

function sql(value) {
  return `'${String(value ?? "").replaceAll("\u0000", "").replaceAll("'", "''")}'`;
}

const bookRows = loadCsv(booksPath, ["id_livre", "cote_livre", "code_manuscrit", "code_publication", "code_edition", "code_parution"]);
const entryRows = loadCsv(entriesPath, ["id_entree", "id_livre", "ordre", "identifiant_source_entree", "id_auteur_source", "titre_entree", "page"]);
const bookIds = new Set();
const statements = ["PRAGMA foreign_keys = ON;"];

for (const { rowNumber, value } of bookRows) {
  const bookId = integer(value.id_livre, "id_livre", rowNumber);
  if (bookId === 0 || bookIds.has(bookId)) {
    throw new Error(`id_livre dupliqué ou invalide à la ligne ${rowNumber}.`);
  }
  bookIds.add(bookId);
  const columns = ["book_id", "shelfmark", "manuscript_code", "publication_code", "edition_code", "issue_code", "source_author_id", "source_contributor_id", "source_publisher_id", "is_available", "author_count", "chapter_count", "title_count", "availability_details", "bnf_data", "remarks", "weight", "genre_source_code", "genre_source_label", "rubric_source_code", "rubric_source_label"];
  const values = [bookId, value.cote_livre, value.code_manuscrit, value.code_publication, value.code_edition, value.code_parution, value.id_auteur_source, value.id_contributeur_source, value.id_editeur_source, boolean(value.sommaire_disponible, "sommaire_disponible", rowNumber), integer(value.nombre_auteurs_sommaire || "0", "nombre_auteurs_sommaire", rowNumber), integer(value.nombre_chapitres_sommaire || "0", "nombre_chapitres_sommaire", rowNumber), integer(value.nombre_titres_sommaire || "0", "nombre_titres_sommaire", rowNumber), value.organismes_disponibilite, value.donnees_bnf, value.remarques, value.poids, value.code_genre_source, value.genre_source, value.code_rubrique_source, value.rubrique_source];
  const update = columns.slice(1).map((column) => `${column} = excluded.${column}`).join(", ");
  statements.push(`INSERT INTO book_table_of_contents_metadata (${columns.join(", ")}) VALUES (${values.map(sql).join(", ")}) ON CONFLICT(book_id) DO UPDATE SET ${update};`);
}

const entriesByBook = new Map();
for (const { rowNumber, value } of entryRows) {
  const bookId = integer(value.id_livre, "id_livre", rowNumber);
  if (!bookIds.has(bookId)) {
    throw new Error(`Ligne ${rowNumber} : id_livre absent du fichier ouvrages.`);
  }
  const position = integer(value.ordre, "ordre", rowNumber);
  if (position === 0 || !text(value.identifiant_source_entree) || !text(value.titre_entree)) {
    throw new Error(`Entrée incomplète à la ligne ${rowNumber}.`);
  }
  const entries = entriesByBook.get(bookId) ?? [];
  entries.push({ position, sourceEntryId: value.identifiant_source_entree, sourceAuthorId: value.id_auteur_source, title: value.titre_entree, page: value.page, rowNumber });
  entriesByBook.set(bookId, entries);
}

for (const bookId of bookIds) {
  statements.push(`DELETE FROM book_table_of_contents_entries WHERE book_id = ${bookId};`);
  const entries = entriesByBook.get(bookId) ?? [];
  const positions = new Set();
  const sourceIds = new Set();
  for (const entry of entries.sort((left, right) => left.position - right.position)) {
    if (positions.has(entry.position) || sourceIds.has(entry.sourceEntryId)) {
      throw new Error(`Entrée dupliquée à la ligne ${entry.rowNumber}.`);
    }
    positions.add(entry.position);
    sourceIds.add(entry.sourceEntryId);
    statements.push(`INSERT INTO book_table_of_contents_entries (book_id, position, source_entry_id, source_author_id, title, page) VALUES (${bookId}, ${entry.position}, ${sql(entry.sourceEntryId)}, ${sql(entry.sourceAuthorId)}, ${sql(entry.title)}, ${sql(entry.page)});`);
  }
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ outputPath, books: bookRows.length, entries: entryRows.length, booksWithEntries: entriesByBook.size }) + "\n");
