import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = process.env.STAVNET_PERSON_CONSOLIDATION_FILE ?? resolve("cloudflare", ".generated", "consolidate-people.sql");
const fields = ["Type Personne", "Type", "Langue Écriture", "Langue Ecriture", "Date de Naissance", "Date Naissance", "Date de Décès", "Date Décès", "Pays de Résidence", "Lieu Résidence", "Activité Professionnelle", "Activite Professionnelle", "Biographie", "Nom Prénom", "Nom Prenom"];
function jsonPath(field) {
  return `$."${field.replaceAll('"', '\\"')}"`;
}

const score = fields.map((field) => `CASE WHEN TRIM(COALESCE(json_extract(payload, '${jsonPath(field)}'), '')) <> '' THEN 1 ELSE 0 END`).join(" + ");
const ranked = `WITH ranked AS (SELECT id, normalized_name, payload, ${score} AS completeness, ROW_NUMBER() OVER (PARTITION BY normalized_name ORDER BY ${score} DESC, id ASC) AS rank FROM people)`;
const fieldPairs = fields.flatMap((field) => {
  const path = jsonPath(field);
  return [`'${path}'`, `COALESCE(NULLIF(json_extract(payload, '${path}'), ''), (SELECT json_extract(source.payload, '${path}') FROM people AS source WHERE source.normalized_name = people.normalized_name AND TRIM(COALESCE(json_extract(source.payload, '${path}'), '')) <> '' ORDER BY source.id ASC LIMIT 1), json_extract(payload, '${path}'))`];
}).join(", ");
const statements = [
  `${ranked} UPDATE people SET payload = json_set(payload, '$.dataQuality.status', 'archived', '$.dataQuality.canonicalPersonId', (SELECT canonical.id FROM ranked AS canonical WHERE canonical.normalized_name = people.normalized_name AND canonical.rank = 1), '$.dataQuality.archivedAt', '${new Date().toISOString()}') WHERE id IN (SELECT id FROM ranked WHERE rank > 1);`,
  `${ranked} UPDATE people SET payload = json_set(payload, '$.dataQuality.status', 'canonical', '$.dataQuality.archivedSourceIds', json((SELECT json_group_array(id) FROM ranked AS archived WHERE archived.normalized_name = people.normalized_name AND archived.rank > 1)), '$.dataQuality.archivedDuplicates', json((SELECT json_group_array(json(payload)) FROM ranked AS archived WHERE archived.normalized_name = people.normalized_name AND archived.rank > 1)), '$.dataQuality.consolidatedAt', '${new Date().toISOString()}') WHERE id IN (SELECT id FROM ranked WHERE rank = 1 AND EXISTS (SELECT 1 FROM ranked AS duplicate WHERE duplicate.normalized_name = ranked.normalized_name AND duplicate.rank > 1));`,
  `UPDATE people SET payload = json_set(payload, ${fieldPairs}) WHERE COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') = 'canonical';`,
  "UPDATE app_stats SET value = (SELECT COUNT(*) FROM people WHERE COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived') WHERE key = 'people_total';",
];
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ outputPath, statements: statements.length }) + "\n");
