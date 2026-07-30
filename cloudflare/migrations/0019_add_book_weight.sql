ALTER TABLE books ADD COLUMN weight TEXT NOT NULL DEFAULT '';

UPDATE books
SET weight = COALESCE(json_extract(payload, '$.Poids'), '');
