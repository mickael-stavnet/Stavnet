import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const localDatabaseDirectory = resolve(process.cwd(), "cloudflare", ".wrangler", "local-db");

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

const sqliteFile = findSqliteFile(localDatabaseDirectory);

if (!sqliteFile) {
  throw new Error("Aucune base SQLite locale n'a été trouvée. Exécutez d'abord pnpm run db:local:sync.");
}

const result = spawnSync("docker", [
  "run",
  "--rm",
  "-it",
  "-v",
  `${localDatabaseDirectory}:/data`,
  "alpine:3.22",
  "sh",
  "-c",
  `apk add --no-cache sqlite >/dev/null && sqlite3 /data/${sqliteFile.slice(localDatabaseDirectory.length + 1).replaceAll("\\", "/")}`,
], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
