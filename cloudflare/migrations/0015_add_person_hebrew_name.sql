UPDATE people
SET payload = json_set(payload, '$."Nom Auteur Hébreu"', '')
WHERE json_type(payload, '$."Nom Auteur Hébreu"') IS NULL;
