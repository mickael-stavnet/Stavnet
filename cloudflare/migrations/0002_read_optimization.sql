ALTER TABLE people ADD COLUMN normalized_name TEXT NOT NULL DEFAULT '';
ALTER TABLE organizations ADD COLUMN normalized_name TEXT NOT NULL DEFAULT '';
ALTER TABLE books ADD COLUMN is_valid INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS book_facets (
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  facet TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_title TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (book_id, facet, value)
);

CREATE TABLE IF NOT EXISTS book_publishers (
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  normalized_name TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (book_id, position)
);

CREATE TABLE IF NOT EXISTS book_work_titles (
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  PRIMARY KEY (book_id, value)
);

CREATE TABLE IF NOT EXISTS app_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS book_facets_lookup_idx ON book_facets(facet, value, sort_title, book_id);
CREATE INDEX IF NOT EXISTS book_publishers_lookup_idx ON book_publishers(normalized_name, book_id);
CREATE INDEX IF NOT EXISTS book_work_titles_lookup_idx ON book_work_titles(value, book_id);
CREATE INDEX IF NOT EXISTS books_valid_sort_idx ON books(is_valid, sort_year DESC, title, id);
CREATE INDEX IF NOT EXISTS people_name_idx ON people(normalized_name);
CREATE INDEX IF NOT EXISTS organizations_name_idx ON organizations(normalized_name);
