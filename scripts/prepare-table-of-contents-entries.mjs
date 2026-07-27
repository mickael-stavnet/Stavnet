import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dataDirectory = process.env.STAVNET_TABLE_OF_CONTENTS_DATA_DIR ?? resolve(process.cwd(), "..", "DATA");
const rawPath = process.env.STAVNET_TABLE_OF_CONTENTS_SOURCE_FILE ?? resolve(dataDirectory, "table-de-matiere.csv");
const booksPath = process.env.STAVNET_TABLE_OF_CONTENTS_BOOKS_FILE ?? resolve(dataDirectory, "import-table-de-matiere.csv");
const outputPath = process.env.STAVNET_TABLE_OF_CONTENTS_ENTRIES_FILE ?? resolve(dataDirectory, "import-entrees-table-de-matiere.csv");

function text(value) {
  return String(value ?? "").trim();
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

  return rows;
}

function records(path) {
  const rows = parseCsv(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
  const [headers = [], ...dataRows] = rows;
  const normalizedHeaders = headers.map(text);
  return dataRows
    .filter((row) => row.some((value) => text(value)))
    .map((row) => Object.fromEntries(normalizedHeaders.map((header, index) => [header, text(row[index])])));
}

function csvCell(value) {
  const normalized = String(value ?? "");
  return /[";\r\n]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
}

const booksByShelfmark = new Map(records(booksPath).map((book) => [text(book.cote_livre), text(book.id_livre)]));
const rawRows = records(rawPath);
const entries = [];
const seen = new Set();
const orderByBook = new Map();
let currentBookId = "";

for (const row of rawRows) {
  const shelfmark = text(row.CoteLivre);
  const bookId = booksByShelfmark.get(shelfmark);
  if (bookId) {
    currentBookId = bookId;
  }

  const title = text(row["Bouton AuteurCollectif::MatièreTitre"]);
  if (!title) {
    continue;
  }

  const sourceEntryId = text(row["Bouton AuteurCollectif::CodeMatière"]);
  const sourceShelfmark = sourceEntryId.includes("--") ? sourceEntryId.slice(0, sourceEntryId.indexOf("--")) : "";
  const entryBookId = booksByShelfmark.get(sourceShelfmark) ?? currentBookId;
  if (!entryBookId) {
    throw new Error(`Livre parent introuvable pour « ${title} ».`);
  }

  const sourceAuthorId = text(row["Bouton AuteurCollectif::CodeAuteur1"]);
  const page = text(row["Bouton AuteurCollectif::PageNuméro"]);
  const signature = [entryBookId, sourceEntryId, sourceAuthorId, title, page].join("|");
  if (seen.has(signature)) {
    continue;
  }

  seen.add(signature);
  const order = (orderByBook.get(entryBookId) ?? 0) + 1;
  orderByBook.set(entryBookId, order);
  entries.push([`${entryBookId}-${order}`, entryBookId, order, sourceEntryId, sourceAuthorId, title, page]);
}

const headers = ["id_entree", "id_livre", "ordre", "identifiant_source_entree", "id_auteur_source", "titre_entree", "page"];
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${[headers, ...entries].map((row) => row.map(csvCell).join(";")).join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ outputPath, entries: entries.length, books: new Set(entries.map((entry) => entry[1])).size }) + "\n");
