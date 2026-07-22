UPDATE people
SET payload = json_set(payload, '$."Langue Écriture"', 'Hébreu')
WHERE normalized_name = 'aharon appelfeld';
