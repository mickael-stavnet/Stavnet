CREATE TABLE IF NOT EXISTS book_list_items (
  book_id INTEGER PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  sort_year INTEGER,
  author TEXT NOT NULL DEFAULT '',
  publisher TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  writing_language TEXT NOT NULL DEFAULT '',
  publication_year TEXT NOT NULL DEFAULT '',
  publication_code TEXT NOT NULL DEFAULT '',
  is_valid INTEGER NOT NULL DEFAULT 1
);

INSERT OR REPLACE INTO book_list_items (book_id, title, sort_year, author, publisher, language, writing_language, publication_year, publication_code, is_valid)
SELECT
  id,
  title,
  sort_year,
  trim(COALESCE(json_extract(payload, '$."Auteur. 1. Nom"'), '') || CASE WHEN COALESCE(json_extract(payload, '$."Auteur. 1. Nom"'), '') <> '' AND COALESCE(json_extract(payload, '$."Auteur. 1. Prénom"'), '') <> '' THEN ' ' ELSE '' END || COALESCE(json_extract(payload, '$."Auteur. 1. Prénom"'), '')),
  COALESCE(json_extract(payload, '$."Éditeur. 1. Nom"'), json_extract(payload, '$."Éditeur"'), ''),
  COALESCE(json_extract(payload, '$.Langue'), ''),
  COALESCE(json_extract(payload, '$."Auteur. 1. Langue"'), json_extract(payload, '$."Auteur. 2. Langue"'), json_extract(payload, '$."Auteur. 3. Langue"'), ''),
  COALESCE(json_extract(payload, '$.Année'), ''),
  COALESCE(json_extract(payload, '$."Année. Pages. Dimensions"'), ''),
  is_valid
FROM books;

CREATE INDEX IF NOT EXISTS book_list_items_page_idx ON book_list_items(is_valid, sort_year DESC, title, book_id);
