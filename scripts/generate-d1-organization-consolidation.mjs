import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = process.env.STAVNET_ORGANIZATION_CONSOLIDATION_FILE ?? resolve("cloudflare", ".generated", "consolidate-organizations.sql");
const generatedAt = new Date().toISOString();
const corrections = [
  [4, "Ma’ariv"], [48, "L’Age d’Homme"], [67, "J’ai lu"], [69, "Théâtre des Treize Vents"], [120, "Ministère de la Défense"], [136, "A compte d’auteur"], [244, "Denoël"], [333, "Israël Universities Press"], [346, "Kol Israël"], [353, "Le Serpent à Plumes"], [396, "Noël Blandin"], [432, "Presses de la Cité"], [465, "Hérissey"], [541, "Coeckelberghs Bokförlag"], [622, "Jüdischer Buchverlag"], [655, "Ministère de l’Eduction et de la Culture"], [757, "Calmann-Lévy"], [766, "Büchergilde Gutenberg"], [791, "Bussière"], [797, "Caractères"], [800, "José Corti"], [808, "François Bourin"], [815, "L’Escampette"], [817, "Taillis Pré"], [822, "Métropolis"], [827, "Phébus"], [828, "St-Germain-des-Prés"], [830, "Editeurs Français Réunis"], [835, "Périple"], [838, "Tirésias"], [840, "Publication de l'Université de Saint-Étienne"], [850, "Apogée"], [851, "L’Atelier des Brisants"], [852, "Trévise"], [864, "Ma’arechet"], [865, "Sa’ar"], [971, "Bastei Lübbe"], [1009, "Planète"], [1103, "Institut Français"], [1109, "Y. Rivière"], [1122, "Moadon Israéli le-tarbut"], [1125, "le Livre à la carte-Libris"], [1154, "G. Müller"], [1158, "Lübbe"], [1159, "RM-Buch-und-Medien-Vertrieb [u.a.]"], [1160, "Weltbild"], [1188, "Myël"],
];
const groups = [
  [10, 168], [51, 517], [94, 114], [140, 154], [294, 1000], [315, 680], [448, 449], [1180, 1182], [1159, 1167],
];
const bookPublisherCorrections = [
  [4794, 1, "Lübbe"], [4799, 1, "RM-Buch-und-Medien-Vertrieb [u.a.]"], [4800, 1, "Weltbild"],
];

function normalizedName(value) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const correctionStatements = corrections.map(([id, name]) => `UPDATE organizations SET name = ${sql(name)}, normalized_name = ${sql(normalizedName(name))}, payload = json_set(payload, '$.Organisme', ${sql(name)}, '$.dataQuality.status', COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical'), '$.dataQuality.encodingCorrections', json_array(json_object('field', 'Organisme', 'previousValue', name, 'correctedValue', ${sql(name)}, 'correctedAt', ${sql(generatedAt)}))) WHERE id = ${id};`);
const archiveStatements = groups.map(([canonicalId, archivedId]) => `UPDATE organizations SET payload = json_set(payload, '$.dataQuality.status', 'archived', '$.dataQuality.canonicalOrganizationId', ${canonicalId}, '$.dataQuality.archivedAt', ${sql(generatedAt)}) WHERE id = ${archivedId};`);
const canonicalStatements = groups.map(([canonicalId, archivedId]) => `UPDATE organizations SET payload = json_set(payload, '$.dataQuality.status', 'canonical', '$.dataQuality.archivedSourceIds', json_array(${archivedId}), '$.dataQuality.archivedDuplicates', json_array(json((SELECT payload FROM organizations WHERE id = ${archivedId}))), '$.dataQuality.aliases', json_array(name, (SELECT name FROM organizations WHERE id = ${archivedId})), '$.dataQuality.aliasNormalizedNames', json_array(normalized_name, (SELECT normalized_name FROM organizations WHERE id = ${archivedId})), '$.dataQuality.consolidatedAt', ${sql(generatedAt)}) WHERE id = ${canonicalId};`);
const bookStatements = bookPublisherCorrections.flatMap(([bookId, position, name]) => [
  `UPDATE book_publishers SET name = ${sql(name)}, normalized_name = ${sql(normalizedName(name))} WHERE book_id = ${bookId} AND position = ${position};`,
  `UPDATE books SET payload = json_set(payload, '$.Éditeur', ${sql(name)}, '$."Éditeur. 1. Nom"', ${sql(name)}, '$.dataQuality.publisherCorrections', json_array(json_object('previousValue', json_extract(payload, '$.Éditeur'), 'correctedValue', ${sql(name)}, 'correctedAt', ${sql(generatedAt)}))) WHERE id = ${bookId};`,
  `UPDATE book_list_items SET publisher = ${sql(name)} WHERE book_id = ${bookId};`,
]);
const statements = [...correctionStatements, ...bookStatements, ...archiveStatements, ...canonicalStatements, "UPDATE app_stats SET value = (SELECT COUNT(*) FROM organizations WHERE COALESCE(json_extract(payload, '$.dataQuality.status'), 'canonical') <> 'archived') WHERE key = 'organizations_total';"];

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
process.stdout.write(JSON.stringify({ outputPath, organizationsCorrected: corrections.length, archivedOrganizations: groups.length, publisherRelationsCorrected: bookPublisherCorrections.length, statements: statements.length }) + "\n");
