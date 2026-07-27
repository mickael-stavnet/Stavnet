import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectDirectory = process.cwd();
const localDatabaseDirectory = resolve(projectDirectory, "cloudflare", ".wrangler", "local-db");
const snapshotDirectory = resolve(projectDirectory, "cloudflare", ".local-db");
const snapshotPath = resolve(snapshotDirectory, "stavnet-production.sql");
const tableSnapshotDirectory = resolve(snapshotDirectory, "tables");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const wranglerArguments = ["--yes", "wrangler@4.26.1"];
const configurationArguments = ["--config", "cloudflare/wrangler.jsonc"];
const productionTables = [
  "admin_audit_logs",
  "app_stats",
  "book_bibliographies",
  "book_facets",
  "book_list_items",
  "book_organization_links",
  "book_people_links",
  "book_press_reviews",
  "book_publishers",
  "book_table_of_contents_entries",
  "book_table_of_contents_metadata",
  "book_work_titles",
  "books",
  "organizations",
  "people",
  "relation_migration_review",
  "star_showcase_config",
];

function runWrangler(argumentsList) {
  const result = spawnSync(npxCommand, [...wranglerArguments, ...argumentsList], {
    cwd: projectDirectory,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function findSqliteFile(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFile = findSqliteFile(entryPath);
      if (nestedFile) {
        return nestedFile;
      }
    }

    if (entry.isFile() && entry.name.endsWith(".sqlite")) {
      return entryPath;
    }
  }

  return null;
}

function importWithDocker() {
  const sqliteFile = findSqliteFile(localDatabaseDirectory);

  if (!sqliteFile) {
    throw new Error("La base SQLite locale n'a pas été créée par Wrangler.");
  }

  const sqliteRelativePath = relative(localDatabaseDirectory, sqliteFile).replaceAll("\\", "/");
  const containerCommand = [
    "apk add --no-cache sqlite >/dev/null",
    `cp /out/${sqliteRelativePath} /tmp/stavnet.sqlite`,
    `[ ! -f /out/${sqliteRelativePath}-wal ] || cp /out/${sqliteRelativePath}-wal /tmp/stavnet.sqlite-wal`,
    `[ ! -f /out/${sqliteRelativePath}-shm ] || cp /out/${sqliteRelativePath}-shm /tmp/stavnet.sqlite-shm`,
    "sqlite3 /tmp/stavnet.sqlite '.read /seed/stavnet-production.sql'",
    "sqlite3 /tmp/stavnet.sqlite 'PRAGMA wal_checkpoint(TRUNCATE);'",
    `cp /tmp/stavnet.sqlite /out/${sqliteRelativePath}`,
    `rm -f /out/${sqliteRelativePath}-wal /out/${sqliteRelativePath}-shm`,
  ].join(" && ");
  const result = spawnSync("docker", [
    "run",
    "--rm",
    "-v",
    `${localDatabaseDirectory}:/out`,
    "-v",
    `${snapshotDirectory}:/seed:ro`,
    "alpine:3.22",
    "sh",
    "-c",
    containerCommand,
  ], {
    cwd: projectDirectory,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

mkdirSync(snapshotDirectory, { recursive: true });
mkdirSync(tableSnapshotDirectory, { recursive: true });

for (const tableName of productionTables) {
  runWrangler([
    "d1",
    "export",
    "stavnet-production",
    "--remote",
    "--table",
    tableName,
    "--no-schema",
    "--output",
    resolve(tableSnapshotDirectory, `${tableName}.sql`),
    ...configurationArguments,
  ]);
}

writeFileSync(
  snapshotPath,
  [
    "PRAGMA foreign_keys = OFF;",
    ...productionTables.map((tableName) => readFileSync(resolve(tableSnapshotDirectory, `${tableName}.sql`), "utf8")),
    "INSERT INTO books_search(books_search) VALUES('rebuild');",
    "DELETE FROM book_titles_search;",
    "INSERT INTO book_titles_search (book_id, value) SELECT book_id, value FROM book_work_titles;",
    "PRAGMA foreign_keys = ON;",
  ].join("\n"),
);

if (existsSync(localDatabaseDirectory)) {
  rmSync(localDatabaseDirectory, { recursive: true, force: true });
}

mkdirSync(localDatabaseDirectory, { recursive: true });

runWrangler([
  "d1",
  "migrations",
  "apply",
  "DB",
  "--local",
  "--persist-to",
  localDatabaseDirectory,
  ...configurationArguments,
]);

importWithDocker();
