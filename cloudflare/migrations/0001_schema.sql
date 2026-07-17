CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  sort_year INTEGER,
  search_text TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS book_bibliographies (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  shelfmark TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS book_press_reviews (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  source_field TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  author_name TEXT NOT NULL DEFAULT '',
  source_name TEXT NOT NULL DEFAULT '',
  source_date TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  raw_attribution TEXT NOT NULL DEFAULT '',
  is_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS star_showcase_config (
  id TEXT PRIMARY KEY CHECK (id = 'default'),
  selected_author_names TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS books_search USING fts5(title, search_text, content='books', content_rowid='id');

CREATE INDEX IF NOT EXISTS books_sort_year_idx ON books(sort_year DESC, title, id);
CREATE INDEX IF NOT EXISTS book_bibliographies_book_position_idx ON book_bibliographies(book_id, position);
CREATE INDEX IF NOT EXISTS book_press_reviews_book_position_idx ON book_press_reviews(book_id, position);
