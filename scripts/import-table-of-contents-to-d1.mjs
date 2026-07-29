import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dataDirectory = process.env.STAVNET_TABLE_OF_CONTENTS_DATA_DIR ?? resolve(process.cwd(), "..", "DATA");
const sourcePath = process.env.STAVNET_TABLE_OF_CONTENTS_SOURCE_FILE ?? resolve(dataDirectory, "table-de-matières.csv");
const booksPath = process.env.STAVNET_TABLE_OF_CONTENTS_BOOKS_FILE ?? resolve(dataDirectory, "import-table-de-matiere.csv");
const outputPath = process.env.STAVNET_TABLE_OF_CONTENTS_SQL_FILE ?? resolve(process.cwd(), "cloudflare", ".generated", "import-table-of-contents.sql");

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
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += character;
  }

  if (quoted) throw new Error("Champ CSV non terminé.");
  if (value.length > 0 || row.length > 0) rows.push([...row, value]);
  return rows;
}

function records(path, requiredHeaders) {
  const rows = parseCsv(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
  const [headers = [], ...dataRows] = rows;
  const normalizedHeaders = headers.map(text);
  for (const header of requiredHeaders) {
    if (!normalizedHeaders.includes(header)) throw new Error(`Colonne obligatoire absente : ${header}.`);
  }
  return dataRows
    .filter((row) => row.some((value) => text(value)))
    .map((row, index) => ({ rowNumber: index + 2, value: Object.fromEntries(normalizedHeaders.map((header, column) => [header, text(row[column])])) }));
}

function bookKey(title, subtitle, year) {
  return [text(title), text(subtitle), text(year)].join("|");
}

function integer(value, field, rowNumber) {
  const parsed = Number.parseInt(text(value), 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${field} invalide à la ligne ${rowNumber}.`);
  return parsed;
}

function sql(value) {
  return `'${String(value ?? "").replaceAll("\u0000", "").replaceAll("'", "''")}'`;
}

function entryType(title) {
  const normalized = text(title).toLocaleLowerCase("fr-FR");
  if (normalized === "avant-propos") return "avant-propos";
  if (normalized === "introduction") return "introduction";
  if (normalized === "bibliographie") return "bibliographie";
  return "nouvelle";
}

const bookRows = records(booksPath, ["id_livre", "titre", "sous_titre", "annee"]);
const booksByKey = new Map();
for (const { rowNumber, value } of bookRows) {
  const key = bookKey(value.titre, value.sous_titre, value.annee);
  if (booksByKey.has(key)) throw new Error(`Ouvrage dupliqué dans le référentiel à la ligne ${rowNumber}.`);
  booksByKey.set(key, integer(value.id_livre, "id_livre", rowNumber));
}

const sourceRows = records(sourcePath, ["OuvrageTitre", "OuvrageSousTitre", "Année", "MatièreTitre", "PageNuméro", "MatièreAuteur1 Nom", "MatièreAuteur1 Prénom", "MatièreAuteur1 LangueEcriture", "MatièreTraducteur1 Nom", "MatièreTraducteur1 Prénom", "MatièreTraducteur1 Langue"]);
const entriesByBook = new Map();
for (const { rowNumber, value } of sourceRows) {
  const bookId = booksByKey.get(bookKey(value.OuvrageTitre, value.OuvrageSousTitre, value.Année));
  if (!bookId) throw new Error(`Ouvrage introuvable pour la ligne ${rowNumber} : ${value.OuvrageTitre}.`);
  const title = text(value.MatièreTitre);
  if (!title) throw new Error(`Titre de contribution absent à la ligne ${rowNumber}.`);
  const entries = entriesByBook.get(bookId) ?? [];
  entries.push({ rowNumber, title, page: text(value.PageNuméro), entryType: entryType(title), authorLastName: text(value["MatièreAuteur1 Nom"]), authorFirstName: text(value["MatièreAuteur1 Prénom"]), authorWritingLanguage: text(value["MatièreAuteur1 LangueEcriture"]), translatorLastName: text(value["MatièreTraducteur1 Nom"]), translatorFirstName: text(value["MatièreTraducteur1 Prénom"]), translatorLanguage: text(value["MatièreTraducteur1 Langue"]) });
  entriesByBook.set(bookId, entries);
}

const statements = ["PRAGMA foreign_keys = ON;"];
for (const [bookId, entries] of entriesByBook) {
  statements.push(`DELETE FROM book_table_of_contents_entries WHERE book_id = ${bookId};`);
  entries.sort((left, right) => {
    const leftPage = Number.parseInt(left.page, 10);
    const rightPage = Number.parseInt(right.page, 10);
    if (Number.isFinite(leftPage) && Number.isFinite(rightPage)) return leftPage - rightPage;
    if (Number.isFinite(leftPage)) return -1;
    if (Number.isFinite(rightPage)) return 1;
    return left.rowNumber - right.rowNumber;
  });
  entries.forEach((entry, index) => {
    const values = [bookId, index + 1, entry.entryType, entry.title, entry.page, entry.authorLastName, entry.authorFirstName, entry.authorWritingLanguage, entry.translatorLastName, entry.translatorFirstName, entry.translatorLanguage];
    statements.push(`INSERT INTO book_table_of_contents_entries (book_id, position, entry_type, title, page, author_last_name, author_first_name, author_writing_language, translator_last_name, translator_first_name, translator_language) VALUES (${values.map(sql).join(", ")});`);
  });
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ outputPath, books: entriesByBook.size, entries: sourceRows.length }) + "\n");
