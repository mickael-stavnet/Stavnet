CREATE INDEX IF NOT EXISTS people_type_filter_idx ON people(COALESCE(json_extract(payload, '$."Type Personne"'), json_extract(payload, '$.Type'), ''));
CREATE INDEX IF NOT EXISTS people_language_filter_idx ON people(COALESCE(json_extract(payload, '$."Langue Écriture"'), json_extract(payload, '$.Langue'), json_extract(payload, '$."Code Langue"'), ''));
CREATE INDEX IF NOT EXISTS organizations_country_filter_idx ON organizations(COALESCE(json_extract(payload, '$.Pays'), ''));
